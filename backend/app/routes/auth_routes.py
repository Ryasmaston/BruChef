from flask import Blueprint, jsonify, request, session
from app.services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        new_user = AuthService.register_user(data)
        session['user_id'] = new_user.id
        session['username'] = new_user.username
        return jsonify({
            "message": "User registered successfully",
            "user": new_user.to_dict()
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        user = AuthService.login_user(data)
        if not user:
            return jsonify({"error": "Invalid username/email or password"}), 401
        session['user_id'] = user.id
        session['username'] = user.username
        return jsonify({
            "message": "Login successful",
            "user": user.to_dict()
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logout successful"}), 200

@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    user = AuthService.get_user_by_id(user_id)
    if not user:
        session.clear()
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200

@auth_bp.route("/check", methods=["GET"])
def check_auth():
    user_id = session.get('user_id')
    if user_id:
        user = AuthService.get_user_by_id(user_id)
        if user:
            return jsonify({
                "authenticated": True,
                "user": user.to_dict()
            }), 200
    return jsonify({"authenticated": False}), 200

@auth_bp.route("/change-password", methods=["PUT"])
def change_password():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        if not old_password or not new_password:
            return jsonify({"error": "Both old and new passwords are required"}), 400
        success = AuthService.update_password(user_id, old_password, new_password)
        if not success:
            return jsonify({"error": "Current password is incorrect"}), 401
        return jsonify({"message": "Password updated successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
