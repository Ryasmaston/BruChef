from flask import Blueprint, jsonify
test_bp = Blueprint("test", __name__)
@test_bp.route("/api/hello")
def hello():
    return jsonify({"message": "Backend words"})
