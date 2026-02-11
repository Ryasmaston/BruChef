from flask import Blueprint, jsonify
test_bp = Blueprint("test", __name__)
@test_bp.route("/api/test")
def hello():
    return jsonify({"message": "Backend works"})
