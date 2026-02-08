from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import uuid
from utils.location_helper import calculate_distance, find_nearby_turfs
from utils.firebase_storage import (
    read_json, write_json, 
    get_user_by_id, get_post_by_id, get_user_by_email, get_user_by_phone,
    add_user, add_post, update_post, update_user, get_all_posts_with_filters,
    get_user_posts, update_group, USERS_COLLECTION, POSTS_COLLECTION
)
from utils.chat_helper import (
    create_group, get_group_by_id, get_user_groups, count_user_active_groups,
    remove_member_from_group, book_turf_for_group, auto_delete_expired_groups,
    send_friend_request, get_pending_friend_requests, get_user_friends,
    accept_friend_request, are_friends,
    send_message, get_group_messages, get_direct_messages
)
from utils.rating_helper import (
    add_rating, get_user_ratings, calculate_user_average_rating,
    create_notification, get_user_notifications, mark_notification_read, mark_all_notifications_read
)
from utils.turf_helper import (
    get_turf_by_id, add_turf, update_turf, delete_turf,
    get_owner_turfs, search_nearby_turfs, get_turf_availability,
    book_turf_slot, cancel_turf_booking, merge_compatible_groups
)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests
socketio = SocketIO(app, cors_allowed_origins="*")

# ======================
# USER ENDPOINTS
# ======================

@app.route('/api/users/register', methods=['POST'])
def register_user():
    """Register a new player or turf owner"""
    data = request.json
    
    # Validate required fields
    required_fields = ['name', 'email', 'phone', 'password']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate password strength
    password = data['password']
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400
    
    # Check if email already exists
    from utils.firebase_storage import get_user_by_email
    existing_user = get_user_by_email(data['email'])
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 400
    
    # Get role (player or turf_owner)
    role = data.get('role', 'player')
    
    # Create user with enhanced profile
    user = {
        'id': str(uuid.uuid4()),
        'name': data['name'],
        'email': data['email'],
        'phone': data['phone'],
        'password': generate_password_hash(password),  # Store hashed password
        'role': role,  # player or turf_owner
        'created_at': datetime.now().isoformat()
    }
    
    if role == 'player':
        user['profile'] = {
            'avatar': data.get('avatar', ''),
            'bio': data.get('bio', ''),
            'skill_level': data.get('skill_level', 'beginner'),
            'preferred_position': data.get('preferred_position', ''),
            'age': data.get('age', None),
            'gender': data.get('gender', ''),
        }
        user['stats'] = {
            'games_played': 0,
            'games_organized': 0,
            'attendance_rate': 100.0,
            'average_rating': 0.0,
            'total_ratings': 0
        }
    elif role == 'turf_owner':
        # Validate turf owner specific fields
        if not data.get('business_name'):
            return jsonify({'error': 'Business name is required for turf owners'}), 400
        if not data.get('business_address'):
            return jsonify({'error': 'Business address is required for turf owners'}), 400
        
        user['business'] = {
            'business_name': data['business_name'],
            'business_address': data['business_address'],
            'contact_person': data.get('contact_person', data['name']),
            'total_turfs': 0,
            'total_bookings': 0,
            'total_revenue': 0.0
        }
    
    add_user(user)
    
    # Remove password from response for security
    user_response = {k: v for k, v in user.items() if k != 'password'}
    
    return jsonify({
        'message': f'{role.replace("_", " ").title()} registered successfully',
        'user': user_response
    }), 201


@app.route('/api/users/login', methods=['POST'])
def login_user():
    """Login existing user by email and password"""
    data = request.json
    
    # Validate required fields
    if 'email' not in data:
        return jsonify({'error': 'Missing required field: email'}), 400
    if 'password' not in data:
        return jsonify({'error': 'Missing required field: password'}), 400
    
    # Find user by email
    from utils.firebase_storage import get_user_by_email
    user = get_user_by_email(data['email'])
    
    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Verify password
    if not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Remove password from response for security
    user_response = {k: v for k, v in user.items() if k != 'password'}
    
    return jsonify({
        'message': 'Login successful',
        'user': user_response
    }), 200


@app.route('/api/turf-owners/register', methods=['POST'])
def register_turf_owner():
    """Register a new turf owner with business details"""
    data = request.json
    
    # Validate required fields
    required_fields = ['name', 'email', 'phone', 'password', 'business_name', 'business_address']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate password strength
    password = data['password']
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400
    
    # Check if email already exists
    from utils.firebase_storage import get_user_by_email
    existing_user = get_user_by_email(data['email'])
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 400
    
    # Create turf owner user
    user = {
        'id': str(uuid.uuid4()),
        'name': data['name'],
        'email': data['email'],
        'phone': data['phone'],
        'password': generate_password_hash(password),
        'role': 'turf_owner',
        'business': {
            'business_name': data['business_name'],
            'business_address': data['business_address'],
            'contact_person': data.get('contact_person', data['name']),
            'total_turfs': 0,
            'total_bookings': 0,
            'total_revenue': 0.0
        },
        'created_at': datetime.now().isoformat()
    }
    
    add_user(user)
    
    # Remove password from response
    user_response = {k: v for k, v in user.items() if k != 'password'}
    
    return jsonify({
        'message': 'Turf owner registered successfully',
        'user': user_response
    }), 201


@app.route('/api/turf-owners/login', methods=['POST'])
def login_turf_owner():
    """Login turf owner by email and password"""
    data = request.json
    
    # Validate required fields
    if 'email' not in data:
        return jsonify({'error': 'Missing required field: email'}), 400
    if 'password' not in data:
        return jsonify({'error': 'Missing required field: password'}), 400
    
    # Find user by email
    from utils.firebase_storage import get_user_by_email
    user = get_user_by_email(data['email'])
    
    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Check if user is turf owner
    if user.get('role') != 'turf_owner':
        return jsonify({'error': 'This account is not a turf owner account. Please use the player login.'}), 403
    
    # Verify password
    if not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Remove password from response
    user_response = {k: v for k, v in user.items() if k != 'password'}
    
    return jsonify({
        'message': 'Turf owner login successful',
        'user': user_response
    }), 200


@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user details"""
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Remove password from response for security
    user_response = {k: v for k, v in user.items() if k != 'password'}
    
    return jsonify(user_response), 200


@app.route('/api/users/<user_id>/profile', methods=['PUT'])
def update_user_profile(user_id):
    """Update user profile"""
    data = request.json
    
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Update profile fields
    if 'avatar' in data:
        user['profile']['avatar'] = data['avatar']
    if 'bio' in data:
        user['profile']['bio'] = data['bio']
    if 'skill_level' in data:
        user['profile']['skill_level'] = data['skill_level']
    if 'preferred_position' in data:
        user['profile']['preferred_position'] = data['preferred_position']
    if 'age' in data:
        user['profile']['age'] = data['age']
    if 'gender' in data:
        user['profile']['gender'] = data['gender']
    
    from utils.firebase_storage import update_user
    update_user(user_id, user)
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user
    }), 200


@app.route('/api/users/<user_id>/posts', methods=['GET'])
def get_user_posts_endpoint(user_id):
    """Get all posts created by a user"""
    from utils.firebase_storage import get_user_posts
    
    posts = get_user_posts(user_id)
    
    # Format posts with basic info
    formatted_posts = []
    for post in posts:
        formatted_posts.append({
            'id': post.get('id'),
            'sport': post.get('sport'),
            'players_needed': post.get('players_needed'),
            'location': post.get('location'),
            'date': post.get('date'),
            'time': post.get('time'),
            'status': post.get('status'),
            'created_at': post.get('created_at'),
            'group_id': post.get('group_id'),
            'group_name': f"{post.get('sport')} at {post.get('location', {}).get('address', 'location')}"
        })
    
    return jsonify({
        'count': len(formatted_posts),
        'posts': formatted_posts
    }), 200


@app.route('/api/users/<user_id>/ratings', methods=['GET'])
def get_user_ratings_alias(user_id):
    """Get user ratings (alias route)"""
    from utils.rating_helper import get_user_ratings
    ratings = get_user_ratings(user_id)
    avg_rating = 0.0
    if ratings:
        avg_rating = sum(r.get('overall_rating', 0) for r in ratings) / len(ratings)
    return jsonify({
        'average_rating': avg_rating,
        'total_ratings': len(ratings),
        'ratings': ratings
    }), 200


@app.route('/api/users/<user_id>/groups', methods=['GET'])
def get_user_groups_alias(user_id):
    """Get groups user is member of (alias route)"""
    from utils.chat_helper import get_user_groups
    groups = get_user_groups(user_id)
    return jsonify({'groups': groups}), 200


@app.route('/api/users/<user_id>/friend-requests', methods=['GET'])
def get_user_friend_requests_alias(user_id):
    """Get friend requests for user (alias route)"""
    from utils.chat_helper import get_pending_friend_requests
    requests = get_pending_friend_requests(user_id)
    return jsonify({'requests': requests}), 200


@app.route('/api/users/<user_id>/friends', methods=['GET'])
def get_user_friends_alias(user_id):
    """Get user's friends list (alias route)"""
    from utils.chat_helper import get_user_friends
    friends = get_user_friends(user_id)
    return jsonify({'friends': friends}), 200


@app.route('/api/users-old/<user_id>/posts', methods=['GET'])
def get_user_posts_endpoint_old(user_id):
    """Get all posts created by a user"""
    from utils.firebase_storage import get_user_posts
    
    posts = get_user_posts(user_id)
    
    # Format posts with basic info
    formatted_posts = []
    for post in posts:
        formatted_posts.append({
            'id': post.get('id'),
            'sport': post.get('sport'),
            'players_needed': post.get('players_needed'),
            'location': post.get('location'),
            'date': post.get('date'),
            'time': post.get('time'),
            'status': post.get('status'),
            'created_at': post.get('created_at'),
            'group_id': post.get('group_id'),
            'group_name': f"{post.get('sport')} at {post.get('location', {}).get('address', 'location')}"
        })
    
    return jsonify({
        'count': len(formatted_posts),
        'posts': formatted_posts
    }), 200


# ======================
# POST ENDPOINTS
# ======================

@app.route('/api/posts/create', methods=['POST'])
def create_post():
    """Create a new post"""
    data = request.json
    
    # Validate required fields
    required_fields = ['user_id', 'sport', 'players_needed', 'location']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate location
    if 'lat' not in data['location'] or 'lng' not in data['location']:
        return jsonify({'error': 'Location must include lat and lng'}), 400
    
    # Verify user exists
    user = get_user_by_id(data['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Create post
    post_id = str(uuid.uuid4())
    group_id = f"group_{post_id}"
    
    post = {
        'id': post_id,
        'user_id': data['user_id'],
        'user_name': user['name'],
        'sport': data['sport'],
        'players_needed': data['players_needed'],
        'accepted_players': [],
        'pending_requests': [],
        'location': {
            'lat': data['location']['lat'],
            'lng': data['location']['lng'],
            'address': data['location'].get('address', '')
        },
        'description': data.get('description', ''),
        'date': data.get('date', ''),
        'time': data.get('time', ''),
        'status': 'open',
        'group_id': group_id,
        'created_at': datetime.now().isoformat()
    }
    
    add_post(post)
    
    # Immediately create group with creator as first member
    group_id = f"group_{post['id']}"
    creator_member = {
        'user_id': user['id'],
        'user_name': user['name']
    }
    group = create_group(post['id'], user['id'], user['name'], [])
    
    # Add creator to accepted players automatically
    post['accepted_players'].append({
        'user_id': user['id'],
        'user_name': user['name'],
        'accepted_at': datetime.now().isoformat()
    })
    
    # Update post status if creator fills all spots (edge case)
    if len(post['accepted_players']) >= post['players_needed']:
        post['status'] = 'full'
    
    update_post(post['id'], post)
    
    # Update creator stats
    user['stats']['games_organized'] += 1
    user['stats']['games_played'] += 1
    update_user(user['id'], user)
    
    return jsonify({
        'message': 'Post created successfully',
        'post': post,
        'group': group
    }), 201


@app.route('/api/posts/nearby', methods=['POST'])
def get_nearby_posts():
    """Get posts within a specified radius using Haversine formula"""
    data = request.json
    
    # Validate required fields
    required_fields = ['lat', 'lng', 'radius_km']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    user_lat = data['lat']
    user_lng = data['lng']
    radius_km = data['radius_km']
    sport_filter = data.get('sport', None)
    
    # Get all posts
    posts = list(read_json(POSTS_COLLECTION).values())
    
    # Filter by distance and optionally by sport
    nearby_posts = []
    for post in posts:
        distance = calculate_distance(
            user_lat, user_lng,
            post['location']['lat'], post['location']['lng']
        )
        
        if distance <= radius_km:
            # Apply sport filter if provided
            if sport_filter and post['sport'].lower() != sport_filter.lower():
                continue
            
            # Ensure group_id exists
            if 'group_id' not in post:
                post['group_id'] = f"group_{post['id']}"
            
            post['distance_km'] = round(distance, 2)
            nearby_posts.append(post)
    
    # Sort by distance
    nearby_posts.sort(key=lambda x: x['distance_km'])
    
    return jsonify({
        'count': len(nearby_posts),
        'posts': nearby_posts
    }), 200


@app.route('/api/posts/nearby-with-turfs', methods=['POST'])
def get_nearby_posts_with_turfs():
    """Get posts near location with nearby turfs"""
    data = request.json
    
    # Support both 'lat'/'lng' and 'user_lat'/'user_lng' params
    user_lat = data.get('lat') or data.get('user_lat')
    user_lng = data.get('lng') or data.get('user_lng')
    radius_km = data.get('radius_km')
    
    # Validate required fields
    if not user_lat or not user_lng or not radius_km:
        return jsonify({'error': 'Missing required fields: lat/user_lat, lng/user_lng, radius_km'}), 400
    
    sport_filter = data.get('sport', None)
    
    # Get all posts
    posts = list(read_json(POSTS_COLLECTION).values())
    
    # Filter by distance and optionally by sport
    nearby_posts = []
    for post in posts:
        distance = calculate_distance(
            user_lat, user_lng,
            post['location']['lat'], post['location']['lng']
        )
        
        if distance <= radius_km:
            # Apply sport filter if provided
            if sport_filter and post['sport'].lower() != sport_filter.lower():
                continue
            
            # Ensure group_id exists
            if 'group_id' not in post:
                post['group_id'] = f"group_{post['id']}"
            
            post['distance_km'] = round(distance, 2)
            
            # Find nearby turfs for this post
            post_lat = post['location']['lat']
            post_lng = post['location']['lng']
            nearby_turfs = find_nearby_turfs(post_lat, post_lng, 5)
            post['nearby_turfs'] = nearby_turfs
            
            nearby_posts.append(post)
    
    # Sort by distance
    nearby_posts.sort(key=lambda x: x['distance_km'])
    
    return jsonify({
        'count': len(nearby_posts),
        'posts': nearby_posts
    }), 200


@app.route('/api/posts/<post_id>', methods=['GET'])
def get_post(post_id):
    """Get post details"""
    post = get_post_by_id(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    # Ensure group_id exists (for backwards compatibility)
    if 'group_id' not in post:
        post['group_id'] = f"group_{post_id}"
    
    return jsonify(post), 200


# ======================
# JOIN REQUEST ENDPOINTS
# ======================

@app.route('/api/posts/<post_id>/join', methods=['POST'])
def join_post(post_id):
    """Directly join a post (no approval needed)"""
    data = request.json
    
    if 'user_id' not in data:
        return jsonify({'error': 'Missing user_id'}), 400
    
    user_id = data['user_id']
    
    # Verify user exists
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get post
    post = get_post_by_id(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    # Check if post is full
    if post['status'] == 'full':
        return jsonify({'error': 'This game is already full. No spots available!'}), 400
    
    # Check if already in the game
    if any(p['user_id'] == user_id for p in post['accepted_players']):
        return jsonify({'error': 'You have already joined this game'}), 400
    
    # Check if user has reached 3 group limit
    user_groups = count_user_active_groups(user_id)
    if user_groups >= 3:
        return jsonify({'error': 'You have reached the maximum of 3 active groups'}), 400
    
    # Ensure group_id exists in post
    if 'group_id' not in post:
        post['group_id'] = group_id
    
    # Directly add user to accepted players
    post['accepted_players'].append({
        'user_id': user_id,
        'user_name': user['name'],
        'accepted_at': datetime.now().isoformat()
    })
    
    # Update status if now full
    if len(post['accepted_players']) >= post['players_needed']:
        post['status'] = 'full'
    
    update_post(post['id'], post)
    
    # Add user to group chat
    group_id = f"group_{post_id}"
    group = get_group_by_id(group_id)
    if group:
        # Add to existing group
        group['members'].append({
            'user_id': user_id,
            'user_name': user['name']
        })
        group = update_group(group['id'], group)
    else:
        # This shouldn't happen as group is created with post, but handle it
        group = create_group(post_id, post['user_id'], post['user_name'], [{
            'user_id': user_id,
            'user_name': user['name']
        }])
    
    # Send notification to post owner
    create_notification(
        post['user_id'],
        'player_joined',
        'New Player Joined! 🎉',
        f'{user["name"]} joined your {post["sport"]} game ({len(post["accepted_players"])}/{post["players_needed"]} players)',
        {'post_id': post_id, 'group_id': group_id}
    )
    
    # Send notification to joining player
    create_notification(
        user_id,
        'joined_game',
        'Successfully Joined! ⚽',
        f'You joined {post["user_name"]}\"s {post["sport"]} game. Check the chat!',
        {'post_id': post_id, 'group_id': group_id}
    )
    
    # Update player stats
    user['stats']['games_played'] += 1
    update_user(user['id'], user)
    
    return jsonify({
        'message': 'Successfully joined the game!',
        'post': post,
        'group': group
    }), 200


@app.route('/api/posts/<post_id>/accept', methods=['POST'])
def accept_request(post_id):
    """Accept a join request and create/update group chat"""
    data = request.json
    
    required_fields = ['owner_id', 'player_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    owner_id = data['owner_id']
    player_id = data['player_id']
    
    # Get post
    post = get_post_by_id(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    # Verify owner
    if post['user_id'] != owner_id:
        return jsonify({'error': 'Only post owner can accept requests'}), 403
    
    # Check if player has reached 3 group limit
    player_groups = count_user_active_groups(player_id)
    if player_groups >= 3:
        return jsonify({'error': 'Player has reached maximum of 3 active groups'}), 400
    
    # Find pending request
    pending_request = None
    for req in post['pending_requests']:
        if req['user_id'] == player_id:
            pending_request = req
            break
    
    if not pending_request:
        return jsonify({'error': 'No pending request from this user'}), 404
    
    # Check if post is already full
    if len(post['accepted_players']) >= post['players_needed']:
        return jsonify({'error': 'Post is already full'}), 400
    
    # Move from pending to accepted
    post['pending_requests'].remove(pending_request)
    post['accepted_players'].append({
        'user_id': pending_request['user_id'],
        'user_name': pending_request['user_name'],
        'accepted_at': datetime.now().isoformat()
    })
    
    # Update status if full
    if len(post['accepted_players']) >= post['players_needed']:
        post['status'] = 'full'
    
    update_post(post['id'], post)
    
    # Create or update group chat
    group_id = f"group_{post_id}"
    existing_group = get_group_by_id(group_id)
    
    if existing_group:
        # Update group with new member
        existing_group['members'].append({
            'user_id': pending_request['user_id'],
            'user_name': pending_request['user_name']
        })
    # Send notification to accepted player
    create_notification(
        player_id,
        'request_accepted',
        'Request Accepted! 🎉',
        f'You have been accepted to join {post["user_name"]}\'s {post["sport"]} game',
        {'post_id': post_id, 'group_id': group_id}
    )
    
    # Update player stats
    player = get_user_by_id(player_id)
    if player:
        player['stats']['games_played'] += 1
        update_user(player['id'], player)
    
        group = update_group(existing_group['id'], existing_group)
    else:
        # Create new group with owner and first accepted player
        members = [{
            'user_id': pending_request['user_id'],
            'user_name': pending_request['user_name']
        }]
        group = create_group(post_id, owner_id, post['user_name'], members)
    
    return jsonify({
        'message': 'Request accepted successfully',
        'post': post,
        'group': group
    }), 200


@app.route('/api/posts/<post_id>/leave', methods=['POST'])
def leave_post(post_id):
    """Leave a post/game"""
    data = request.json
    
    if 'user_id' not in data:
        return jsonify({'error': 'Missing user_id'}), 400
    
    user_id = data['user_id']
    
    # Get post
    post = get_post_by_id(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    # Find user in accepted players
    user_entry = None
    for player in post['accepted_players']:
        if player['user_id'] == user_id:
            user_entry = player
            break
    
    if not user_entry:
        return jsonify({'error': 'You are not in this game'}), 400
    
    # Remove from accepted players
    post['accepted_players'].remove(user_entry)
    
    # Update status back to open if it was full
    if post['status'] == 'full':
        post['status'] = 'open'
    
    update_post(post['id'], post)
    
    # Remove from group
    group_id = f"group_{post_id}"
    group = get_group_by_id(group_id)
    if group:
        # Remove member
        group['members'] = [m for m in group['members'] if m['user_id'] != user_id]
        
        if len(group['members']) == 0:
            # Delete group if empty
            from utils.firebase_storage import delete_group
            delete_group(group_id)
        else:
            update_group(group['id'], group)
    
    # Notify post owner
    create_notification(
        post['user_id'],
        'player_left',
        'Player Left',
        f'{user_entry["user_name"]} left your {post["sport"]} game ({len(post["accepted_players"])}/{post["players_needed"]} players)',
        {'post_id': post_id}
    )
    
    # Update user stats
    user = get_user_by_id(user_id)
    if user and user['stats']['games_played'] > 0:
        user['stats']['games_played'] -= 1
        update_user(user['id'], user)
    
    return jsonify({
        'message': 'Successfully left the game',
        'post': post
    }), 200


@app.route('/api/posts/<post_id>/delete', methods=['DELETE'])
@app.route('/api/posts/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    """Delete a post (creator only)"""
    data = request.json
    
    if 'user_id' not in data:
        return jsonify({'error': 'Missing user_id'}), 400
    
    user_id = data['user_id']
    
    # Get post
    post = get_post_by_id(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    # Verify user is the creator
    if post['user_id'] != user_id:
        return jsonify({'error': 'Only the creator can delete this post'}), 403
    
    # Notify all players
    for player in post['accepted_players']:
        if player['user_id'] != user_id:  # Don't notify creator
            create_notification(
                player['user_id'],
                'game_cancelled',
                'Game Cancelled ❌',
                f'{post["user_name"]}\'s {post["sport"]} game has been cancelled',
                {'post_id': post_id}
            )
    
    # Delete associated group
    group_id = f"group_{post_id}"
    from utils.firebase_storage import delete_group, delete_post
    delete_group(group_id)
    
    # Delete post
    delete_post(post_id)
    
    return jsonify({
        'message': 'Post deleted successfully'
    }), 200


@app.route('/api/posts/<post_id>/kick', methods=['POST'])
def kick_player(post_id):
    """Kick a player from the game (creator only)"""
    data = request.json
    
    required_fields = ['creator_id', 'player_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    creator_id = data['creator_id']
    player_id = data['player_id']
    
    # Get post
    post = get_post_by_id(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    # Verify user is the creator
    if post['user_id'] != creator_id:
        return jsonify({'error': 'Only the creator can kick players'}), 403
    
    # Find player
    player_entry = None
    for player in post['accepted_players']:
        if player['user_id'] == player_id:
            player_entry = player
            break
    
    if not player_entry:
        return jsonify({'error': 'Player not in this game'}), 404
    
    # Remove player
    post['accepted_players'].remove(player_entry)
    
    # Update status back to open if it was full
    if post['status'] == 'full':
        post['status'] = 'open'
    
    update_post(post['id'], post)
    
    # Remove from group
    group_id = f"group_{post_id}"
    group = get_group_by_id(group_id)
    if group:
        group['members'] = [m for m in group['members'] if m['user_id'] != player_id]
        update_group(group['id'], group)
    
    # Notify kicked player
    create_notification(
        player_id,
        'kicked_from_game',
        'Removed from Game',
        f'You were removed from {post["user_name"]}\'s {post["sport"]} game',
        {'post_id': post_id}
    )
    
    return jsonify({
        'message': 'Player kicked successfully',
        'post': post
    }), 200


# ======================
# LEGACY ENDPOINTS (Deprecated - keeping for backward compatibility)
# ======================

@app.route('/api/posts/<post_id>/deny', methods=['POST'])
@app.route('/api/posts/<post_id>/reject', methods=['POST'])
def deny_request(post_id):
    """Deny/Reject a player (remove from accepted players or pending requests)"""
    data = request.json
    
    required_fields = ['owner_id', 'player_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    owner_id = data['owner_id']
    player_id = data['player_id']
    
    # Get post
    post = get_post_by_id(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    # Verify owner
    if post['user_id'] != owner_id:
        return jsonify({'error': 'Only post owner can deny/remove players'}), 403
    
    # Try to find in pending requests first
    pending_request = None
    for req in post.get('pending_requests', []):
        if req['user_id'] == player_id:
            pending_request = req
            break
    
    if pending_request:
        # Remove from pending
        post['pending_requests'].remove(pending_request)
        update_post(post['id'], post)
        
        # Send notification
        create_notification(
            player_id,
            'request_denied',
            'Request Declined',
            f'Your request to join {post["user_name"]}\'s {post["sport"]} game was declined',
            {'post_id': post_id}
        )
        
        return jsonify({
            'message': 'Request denied successfully',
            'post': post
        }), 200
    
    # Try to find in accepted players
    accepted_player = None
    for player in post.get('accepted_players', []):
        if player['user_id'] == player_id:
            accepted_player = player
            break
    
    if not accepted_player:
        return jsonify({'error': 'Player not found in this game'}), 404
    
    # Remove from accepted players
    post['accepted_players'].remove(accepted_player)
    
    # Update status back to open if it was full
    if post['status'] == 'full':
        post['status'] = 'open'
    
    update_post(post['id'], post)
    
    # Remove from group
    group_id = f"group_{post_id}"
    group = get_group_by_id(group_id)
    if group:
        group['members'] = [m for m in group['members'] if m['user_id'] != player_id]
        update_group(group['id'], group)
    
    # Send notification
    create_notification(
        player_id,
        'removed_from_game',
        'Removed from Game',
        f'You were removed from {post["user_name"]}\'s {post["sport"]} game',
        {'post_id': post_id}
    )
    
    return jsonify({
        'message': 'Player removed successfully',
        'post': post
    }), 200


# ======================
# TURF DISCOVERY ENDPOINT
# ======================

@app.route('/api/turfs/nearby', methods=['POST'])
def get_nearby_turfs():
    """Discover nearby cricket turfs using Google Places API"""
    data = request.json
    
    # Validate required fields
    required_fields = ['lat', 'lng', 'radius_km']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    lat = data['lat']
    lng = data['lng']
    radius_km = data['radius_km']
    
    # Call Google Places API
    turfs = find_nearby_turfs(lat, lng, radius_km)
    
    return jsonify({
        'count': len(turfs),
        'turfs': turfs
    }), 200


# ======================
# HEALTH CHECK
# ======================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint with auto-maintenance"""
    try:
        # Test Firebase connection
        from utils.firebase_storage import get_db
        db_client = get_db()
        
        if db_client is None:
            return jsonify({
                'status': 'error',
                'message': 'Firebase Firestore not initialized',
                'storage': 'Firebase Firestore (Not Connected)'
            }), 500
        
        # Clean up expired groups
        deleted_groups = auto_delete_expired_groups()
        
        # Auto-merge compatible groups
        merged = merge_compatible_groups()
        
        return jsonify({
            'status': 'healthy',
            'message': 'Sport API is running with Firebase Firestore',
            'storage': 'Firebase Firestore (Connected)',
            'maintenance': {
                'deleted_expired_groups': deleted_groups,
                'merged_groups': len(merged)
            }
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Health check failed: {str(e)}',
            'storage': 'Firebase Firestore (Error)'
        }), 500


# ======================
# GROUP CHAT ENDPOINTS
# ======================

@app.route('/api/groups/<user_id>', methods=['GET'])
def get_my_groups(user_id):
    """Get all active groups for a user"""
    # Clean up expired groups first
    auto_delete_expired_groups()
    
    groups = get_user_groups(user_id)
    
    return jsonify({
        'count': len(groups),
        'groups': groups
    }), 200


@app.route('/api/group/<group_id>', methods=['GET'])
@app.route('/api/groups/<group_id>/details', methods=['GET'])
def get_single_group(group_id):
    """Get details of a specific group"""
    group = get_group_by_id(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404
    
    return jsonify(group), 200


@app.route('/api/groups/<group_id>/leave', methods=['POST'])
def leave_group(group_id):
    """Leave a group"""
    data = request.json
    
    if 'user_id' not in data:
        return jsonify({'error': 'Missing user_id'}), 400
    
    user_id = data['user_id']
    
    # Get group
    group = get_group_by_id(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404
    
    # Check if user is owner
    if group['owner_id'] == user_id:
        return jsonify({'error': 'Group owner cannot leave. Group will auto-delete after 6 hours of booking.'}), 400
    
    # Remove member
    updated_group = remove_member_from_group(group_id, user_id)
    
    return jsonify({
        'message': 'Left group successfully',
        'group': updated_group
    }), 200


@app.route('/api/groups/<group_id>/book-turf', methods=['POST'])
def book_group_turf(group_id):
    """Book turf for group - triggers 6 hour auto-delete timer"""
    data = request.json
    
    required_fields = ['user_id', 'turf_name', 'turf_address']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    user_id = data['user_id']
    
    # Get group
    group = get_group_by_id(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404
    
    # Verify user is owner
    if group['owner_id'] != user_id:
        return jsonify({'error': 'Only group owner can book turf'}), 403
    
    # Book turf and set auto-delete timer
    updated_group = book_turf_for_group(group_id)
    updated_group['turf_name'] = data['turf_name']
    updated_group['turf_address'] = data['turf_address']
    update_group(updated_group['id'], updated_group)
    
    return jsonify({
        'message': 'Turf booked successfully. Group will be deleted in 6 hours.',
        'group': updated_group
    }), 200


@app.route('/api/groups/<group_id>/messages', methods=['GET'])
def get_group_chat_messages(group_id):
    """Get messages for a group"""
    # Check if requester is member
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id parameter'}), 400
    
    group = get_group_by_id(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404
    
    # Verify user is member or owner
    is_member = group['owner_id'] == user_id
    if not is_member:
        for member in group['members']:
            if member['user_id'] == user_id:
                is_member = True
                break
    
    if not is_member:
        return jsonify({'error': 'You are not a member of this group'}), 403
    
    messages = get_group_messages(group_id)
    
    return jsonify({
        'count': len(messages),
        'messages': messages
    }), 200


@app.route('/api/groups/<group_id>/messages', methods=['POST'])
def send_group_message(group_id):
    """Send a message to group"""
    data = request.json
    
    required_fields = ['user_id', 'message']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    user_id = data['user_id']
    message_text = data['message']
    
    # Get group
    group = get_group_by_id(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404
    
    # Verify user is member or owner
    is_member = group['owner_id'] == user_id
    sender_name = group['owner_name'] if is_member else None
    
    if not is_member:
        for member in group['members']:
            if member['user_id'] == user_id:
                is_member = True
                sender_name = member['user_name']
                break
    
    if not is_member:
        return jsonify({'error': 'You are not a member of this group'}), 403
    
    # Send message
    message = send_message(user_id, sender_name, message_text, group_id=group_id)
    
    return jsonify({
        'message': 'Message sent successfully',
        'data': message
    }), 201


@app.route('/api/groups/<group_id>/members', methods=['GET'])
def get_group_members(group_id):
    """Get all group members with their details (name and phone)"""
    group = get_group_by_id(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404
    
    # Get all users data
    users_dict = read_json(USERS_COLLECTION)
    
    # Build members list with details
    members_details = []
    
    # Add owner
    owner = users_dict.get(group['owner_id'])
    if owner:
        members_details.append({
            'user_id': owner['id'],
            'name': owner['name'],
            'phone': owner.get('phone', 'N/A'),
            'role': 'owner'
        })
    
    # Add other members
    for member in group.get('members', []):
        user = users_dict.get(member['user_id'])
        if user:
            members_details.append({
                'user_id': user['id'],
                'name': user['name'],
                'phone': user.get('phone', 'N/A'),
                'role': 'member',
                'joined_at': member.get('joined_at', '')
            })
    
    return jsonify({
        'group_name': group.get('name', 'Group'),
        'total_members': len(members_details),
        'members': members_details
    }), 200


# ======================
# FRIEND SYSTEM ENDPOINTS
# ======================

@app.route('/api/friends/request', methods=['POST'])
def send_friend_req():
    """Send a friend request"""
    data = request.json
    
    required_fields = ['from_user_id', 'to_user_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    from_user_id = data['from_user_id']
    to_user_id = data['to_user_id']
    
    # Verify both users exist
    from_user = get_user_by_id(from_user_id)
    to_user = get_user_by_id(to_user_id)
    
    if not from_user:
        return jsonify({'error': 'Sender user not found'}), 404
    if not to_user:
        return jsonify({'error': 'Recipient user not found'}), 404
    
    # Send friend request
    friend_request = send_friend_request(
        from_user_id, from_user['name'],
        to_user_id, to_user['name']
    )
    
    if not friend_request:
        return jsonify({'error': 'Friend request already exists or you are already friends'}), 400
    
    # Send notification
    create_notification(
        to_user_id,
        'friend_request',
        'New Friend Request',
        f'{from_user["name"]} sent you a friend request',
        {'from_user_id': from_user_id, 'request_id': friend_request['id']}
    )
    
    return jsonify({
        'message': 'Friend request sent successfully',
        'request': friend_request
    }), 201


@app.route('/api/friends/requests/<user_id>', methods=['GET'])
def get_friend_requests(user_id):
    """Get pending friend requests"""
    requests = get_pending_friend_requests(user_id)
    
    return jsonify({
        'count': len(requests),
        'requests': requests
    }), 200


@app.route('/api/friends/<user_id>', methods=['GET'])
def get_friends_list(user_id):
    """Get user's friends list"""
    friends = get_user_friends(user_id)
    
    return jsonify({
        'count': len(friends),
        'friends': friends
    }), 200


@app.route('/api/friends/accept', methods=['POST'])
def accept_friend_req():
    """Accept a friend request"""
    data = request.json
    
    required_fields = ['request_id', 'user_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    request_id = data['request_id']
    user_id = data['user_id']
    
    # Accept request
    friend_request = accept_friend_request(request_id, user_id)
    
    if not friend_request:
        return jsonify({'error': 'Friend request not found or already accepted'}), 404
    
    # Send notification to requester
    create_notification(
        friend_request['from_user_id'],
        'friend_accepted',
        'Friend Request Accepted!',
        f'{friend_request["to_user_name"]} accepted your friend request',
        {'friend_id': user_id}
    )
    
    return jsonify({
        'message': 'Friend request accepted',
        'friendship': friend_request
    }), 200


# ======================
# DIRECT MESSAGING ENDPOINTS
# ======================

@app.route('/api/messages/direct', methods=['POST'])
def send_direct_msg():
    """Send a direct message to a friend"""
    data = request.json
    
    required_fields = ['from_user_id', 'to_user_id', 'message']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    from_user_id = data['from_user_id']
    to_user_id = data['to_user_id']
    message_text = data['message']
    
    # Verify users are friends
    if not are_friends(from_user_id, to_user_id):
        return jsonify({'error': 'You can only send direct messages to friends'}), 403
# ======================
# RATING SYSTEM ENDPOINTS
# ======================

@app.route('/api/ratings/add', methods=['POST'])
@app.route('/api/ratings/rate-player', methods=['POST'])
def rate_player():
    """Rate a player after a game"""
    data = request.json
    
    required_fields = ['post_id', 'rater_id', 'rated_user_id', 'overall_rating']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    post_id = data['post_id']
    rater_id = data['rater_id']
    rated_user_id = data['rated_user_id']
    
    # Verify users exist
    rater = get_user_by_id(rater_id)
    rated_user = get_user_by_id(rated_user_id)
    
    if not rater:
        return jsonify({'error': 'Rater not found'}), 404
    if not rated_user:
        return jsonify({'error': 'Rated user not found'}), 404
    
    # Verify post exists
    post = get_post_by_id(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    # Cannot rate yourself
    if rater_id == rated_user_id:
        return jsonify({'error': 'Cannot rate yourself'}), 400
    
    # Validate rating values (1-5)
    overall = data['overall_rating']
    if overall < 1 or overall > 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400
    
    # Prepare rating data
    rating_data = {
        'overall_rating': overall,
        'punctuality': data.get('punctuality', overall),
        'skill': data.get('skill', overall),
        'teamwork': data.get('teamwork', overall),
        'sportsmanship': data.get('sportsmanship', overall),
        'review': data.get('review', '')
    }
    
    # Add rating
    rating = add_rating(post_id, rater_id, rater['name'], rated_user_id, rated_user['name'], rating_data)
    
    if not rating:
        return jsonify({'error': 'You have already rated this player for this game'}), 400
    
    # Update rated user's average rating
    avg_ratings = calculate_user_average_rating(rated_user_id)
    rated_user['stats']['average_rating'] = avg_ratings['average_rating']
    rated_user['stats']['total_ratings'] = avg_ratings['total_ratings']
    update_user(rated_user['id'], rated_user)
    
    # Send notification
    create_notification(
        rated_user_id,
        'new_rating',
        'New Rating Received',
        f'{rater["name"]} rated you {overall} stars',
        {'rating_id': rating['id'], 'post_id': post_id}
    )
    
    return jsonify({
        'message': 'Rating submitted successfully',
        'rating': rating,
        'user_average': avg_ratings
    }), 201


@app.route('/api/ratings/user/<user_id>', methods=['GET'])
def get_user_rating_details(user_id):
    """Get all ratings and statistics for a user"""
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    ratings = get_user_ratings(user_id)
    avg_ratings = calculate_user_average_rating(user_id)
    
    return jsonify({
        'user_id': user_id,
        'user_name': user['name'],
        'averages': avg_ratings,
        'ratings': ratings
    }), 200


# ======================
# NOTIFICATION ENDPOINTS
# ======================

@app.route('/api/notifications/<user_id>', methods=['GET'])
def get_notifications(user_id):
    """Get user's notifications"""
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    
    notifications = get_user_notifications(user_id, unread_only)
    
    unread_count = sum(1 for n in notifications if not n['read'])
    
    return jsonify({
        'count': len(notifications),
        'unread_count': unread_count,
        'notifications': notifications
    }), 200


@app.route('/api/notifications/<notification_id>/read', methods=['POST'])
def mark_notif_read(notification_id):
    """Mark a notification as read"""
    data = request.json
    
    if 'user_id' not in data:
        return jsonify({'error': 'Missing user_id'}), 400
    
    user_id = data['user_id']
    
    notification = mark_notification_read(notification_id, user_id)
    
    if not notification:
        return jsonify({'error': 'Notification not found'}), 404
    
    return jsonify({
        'message': 'Notification marked as read',
        'notification': notification
    }), 200


@app.route('/api/notifications/<user_id>/read-all', methods=['PUT', 'POST'])
def mark_all_read(user_id):
    """Mark all user's notifications as read"""
    mark_all_notifications_read(user_id)
    
    return jsonify({
        'message': 'All notifications marked as read'
    }), 200


    
    # Get sender info
    from_user = get_user_by_id(from_user_id)
    if not from_user:
        return jsonify({'error': 'User not found'}), 404
    
    # Send message
    message = send_message(
        from_user_id, from_user['name'],
        message_text, recipient_id=to_user_id
    )
    
    return jsonify({
        'message': 'Direct message sent successfully',
        'data': message
    }), 201


@app.route('/api/messages/direct/<user_id>/<friend_id>', methods=['GET'])
def get_direct_messages_with_friend(user_id, friend_id):
    """Get direct messages between user and friend"""
    # Verify they are friends
    if not are_friends(user_id, friend_id):
        return jsonify({'error': 'You can only view messages with friends'}), 403
    
    messages = get_direct_messages(user_id, friend_id)
    
    return jsonify({
        'count': len(messages),
        'messages': messages
    }), 200


# ======================
# TURF MANAGEMENT ENDPOINTS
# ======================

@app.route('/api/turfs/create', methods=['POST'])
def create_turf():
    """Create a new turf (turf owner only)"""
    data = request.json
    
    required_fields = ['owner_id', 'name', 'location', 'sports', 'pricing', 'timings']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate location has lat, lng
    if 'lat' not in data['location'] or 'lng' not in data['location']:
        return jsonify({'error': 'Location must include lat and lng (latitude and longitude)'}), 400
    
    # Validate pricing has per_hour
    if 'per_hour' not in data['pricing']:
        return jsonify({'error': 'Pricing must include per_hour rate'}), 400
    
    # Validate timings
    if 'opening' not in data['timings'] or 'closing' not in data['timings']:
        return jsonify({'error': 'Timings must include opening and closing times (HH:MM format)'}), 400
    
    # Verify owner exists and is turf_owner
    owner = get_user_by_id(data['owner_id'])
    if not owner:
        return jsonify({'error': 'Owner not found'}), 404
    if owner['role'] != 'turf_owner':
        return jsonify({'error': 'Only turf owners can create turfs'}), 403
    
    turf = {
        'id': str(uuid.uuid4()),
        'owner_id': data['owner_id'],
        'owner_name': owner['name'],
        'name': data['name'],
        'location': {
            'lat': float(data['location']['lat']),
            'lng': float(data['location']['lng']),
            'address': data['location'].get('address', '')
        },
        'sports': data['sports'],  # List of sports: ['cricket', 'football']
        'facilities': data.get('facilities', []),  # ['parking', 'washroom', 'changing room', 'night lights']
        'pricing': {
            'per_hour': float(data['pricing']['per_hour']),
            'currency': data['pricing'].get('currency', 'INR')
        },
        'timings': {
            'opening': data['timings']['opening'],  # Format: "06:00"
            'closing': data['timings']['closing']   # Format: "22:00"
        },
        'images': data.get('images', []),
        'rating': 0.0,
        'total_ratings': 0,
        'total_bookings': 0,
        'bookings': [],
        'status': 'active',
        'created_at': datetime.now().isoformat()
    }
    
    add_turf(turf)
    
    # Update owner stats
    if 'business' in owner:
        owner['business']['total_turfs'] += 1
        update_user(owner['id'], owner)
    
    return jsonify({
        'message': 'Turf created successfully',
        'turf': turf
    }), 201


@app.route('/api/turfs/<turf_id>', methods=['GET'])
def get_turf(turf_id):
    """Get turf details"""
    turf = get_turf_by_id(turf_id)
    if not turf:
        return jsonify({'error': 'Turf not found'}), 404
    
    return jsonify(turf), 200


@app.route('/api/turfs/<turf_id>', methods=['PUT'])
def update_turf_details(turf_id):
    """Update turf details (owner only)"""
    data = request.json
    
    if 'owner_id' not in data:
        return jsonify({'error': 'Missing owner_id'}), 400
    
    turf = get_turf_by_id(turf_id)
    if not turf:
        return jsonify({'error': 'Turf not found'}), 404
    
    if turf['owner_id'] != data['owner_id']:
        return jsonify({'error': 'Only the owner can update this turf'}), 403
    
    # Update fields
    if 'name' in data:
        turf['name'] = data['name']
    if 'location' in data:
        turf['location'] = data['location']
    if 'sports' in data:
        turf['sports'] = data['sports']
    if 'facilities' in data:
        turf['facilities'] = data['facilities']
    if 'pricing' in data:
        turf['pricing'] = data['pricing']
    if 'timings' in data:
        turf['timings'] = data['timings']
    if 'images' in data:
        turf['images'] = data['images']
    if 'status' in data:
        turf['status'] = data['status']
    
    turf['updated_at'] = datetime.now().isoformat()
    update_turf(turf)
    
    return jsonify({
        'message': 'Turf updated successfully',
        'turf': turf
    }), 200


@app.route('/api/turfs/<turf_id>', methods=['DELETE'])
def delete_turf_endpoint(turf_id):
    """Delete turf (owner only)"""
    data = request.json
    
    if 'owner_id' not in data:
        return jsonify({'error': 'Missing owner_id'}), 400
    
    turf = get_turf_by_id(turf_id)
    if not turf:
        return jsonify({'error': 'Turf not found'}), 404
    
    if turf['owner_id'] != data['owner_id']:
        return jsonify({'error': 'Only the owner can delete this turf'}), 403
    
    delete_turf(turf_id)
    
    # Update owner stats
    owner = get_user_by_id(data['owner_id'])
    if owner and 'business' in owner:
        owner['business']['total_turfs'] = max(0, owner['business']['total_turfs'] - 1)
        update_user(owner['id'], owner)
    
    return jsonify({
        'message': 'Turf deleted successfully'
    }), 200


@app.route('/api/turf-owners/<owner_id>/turfs', methods=['GET'])
@app.route('/api/turfs/owner/<owner_id>', methods=['GET'])
@app.route('/api/turf-owners/<owner_id>/turfs', methods=['GET'])
def get_owner_turfs_list(owner_id):
    """Get all turfs for a specific owner"""
    turfs = get_owner_turfs(owner_id)
    
    return jsonify({
        'count': len(turfs),
        'turfs': turfs
    }), 200


@app.route('/api/turfs/search/nearby', methods=['POST'])
def search_turfs_nearby():
    """Search for turfs near a location"""
    data = request.json
    
    required_fields = ['lat', 'lng', 'radius_km']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    lat = data['lat']
    lng = data['lng']
    radius_km = data['radius_km']
    sport = data.get('sport', None)
    
    turfs = search_nearby_turfs(lat, lng, radius_km, sport)
    
    return jsonify({
        'count': len(turfs),
        'turfs': turfs
    }), 200


@app.route('/api/turfs/<turf_id>/availability', methods=['POST'])
def get_availability(turf_id):
    """Get available time slots for a turf on a specific date"""
    data = request.json
    
    if 'date' not in data:
        return jsonify({'error': 'Missing date'}), 400
    
    slots = get_turf_availability(turf_id, data['date'])
    if slots is None:
        return jsonify({'error': 'Turf not found'}), 404
    
    return jsonify({
        'date': data['date'],
        'slots': slots
    }), 200


@app.route('/api/turfs/<turf_id>/book', methods=['POST'])
def book_turf(turf_id):
    """Book a turf slot"""
    data = request.json
    
    required_fields = ['user_id', 'date', 'time_slot']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Verify user
    user = get_user_by_id(data['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    booking_data = {
        'group_id': data.get('group_id', None),
        'user_id': data['user_id'],
        'user_name': user['name'],
        'date': data['date'],
        'time_slot': data['time_slot']
    }
    
    booking = book_turf_slot(turf_id, booking_data)
    if not booking:
        return jsonify({'error': 'Time slot already booked or turf not found'}), 400
    
    # Send notification
    create_notification(
        data['user_id'],
        'turf_booked',
        'Turf Booked! 🏟️',
        f'Your turf booking is confirmed for {data["date"]} at {data["time_slot"]}',
        {'turf_id': turf_id, 'booking_id': booking['id']}
    )
    
    return jsonify({
        'message': 'Turf booked successfully',
        'booking': booking
    }), 201


@app.route('/api/turfs/<turf_id>/bookings/<booking_id>/cancel', methods=['POST'])
def cancel_booking(turf_id, booking_id):
    """Cancel a turf booking"""
    data = request.json
    
    if 'user_id' not in data:
        return jsonify({'error': 'Missing user_id'}), 400
    
    success = cancel_turf_booking(turf_id, booking_id, data['user_id'])
    if not success:
        return jsonify({'error': 'Booking not found or unauthorized'}), 404
    
    return jsonify({
        'message': 'Booking cancelled successfully'
    }), 200


# ======================
# AUTO GROUP MERGING
# ======================

@app.route('/api/groups/merge', methods=['POST'])
def auto_merge_groups():
    """Automatically merge compatible groups (9+ players each)"""
    merged = merge_compatible_groups()
    
    return jsonify({
        'message': f'Successfully merged {len(merged)} group pairs',
        'merged_groups': merged
    }), 200


# ======================
# SOCKET.IO EVENTS - Real-time Chat
# ======================

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print('Client connected:', request.sid)
    emit('connected', {'message': 'Connected to server'})


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print('Client disconnected:', request.sid)


@socketio.on('join_group')
def handle_join_group(data):
    """User joins a group room"""
    group_id = data.get('group_id')
    user_name = data.get('user_name', 'Unknown')
    
    if group_id:
        join_room(group_id)
        print(f'{user_name} joined group {group_id}')
        emit('user_joined', {
            'message': f'{user_name} joined the chat',
            'user_name': user_name
        }, room=group_id, skip_sid=request.sid)


@socketio.on('leave_group')
def handle_leave_group(data):
    """User leaves a group room"""
    group_id = data.get('group_id')
    user_name = data.get('user_name', 'Unknown')
    
    if group_id:
        leave_room(group_id)
        print(f'{user_name} left group {group_id}')
        emit('user_left', {
            'message': f'{user_name} left the chat',
            'user_name': user_name
        }, room=group_id)


@socketio.on('send_message')
def handle_send_message(data):
    """Handle real-time message sending"""
    try:
        group_id = data.get('group_id')
        user_id = data.get('user_id')
        message_text = data.get('message')
        user_name = data.get('user_name', 'Unknown')
        
        if not all([group_id, user_id, message_text]):
            emit('error', {'message': 'Missing required fields'})
            return
        
        # Verify group exists
        group = get_group_by_id(group_id)
        if not group:
            emit('error', {'message': 'Group not found'})
            return
        
        # Save message to database
        message = send_message(user_id, user_name, message_text, group_id=group_id)
        
        # Broadcast to all users in the room
        emit('new_message', {
            'id': message['id'],
            'user_id': user_id,
            'user_name': user_name,
            'message': message_text,
            'timestamp': message['timestamp']
        }, room=group_id)
        
        print(f'Message sent in group {group_id} by {user_name}')
        
    except Exception as e:
        print(f'Error sending message: {str(e)}')
        emit('error', {'message': 'Failed to send message'})


@socketio.on('typing')
def handle_typing(data):
    """Handle typing indicator"""
    group_id = data.get('group_id')
    user_name = data.get('user_name')
    is_typing = data.get('is_typing', False)
    
    if group_id and user_name:
        emit('user_typing', {
            'user_name': user_name,
            'is_typing': is_typing
        }, room=group_id, skip_sid=request.sid)


if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
