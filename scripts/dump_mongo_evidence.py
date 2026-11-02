import json
import os
import sys
from bson import json_util
import pymongo

app_id = sys.argv[1] if len(sys.argv) > 1 else "AICTE-EOA-2026-E2E"
mongo_uri = os.environ.get("MONGODB_URI") or os.environ.get("MONGODB_URL") or "mongodb://127.0.0.1:27017"
db_name = os.environ.get("DATABASE_NAME", "verity_ai")

client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
db = client[db_name]
query = {"application_id": {"$regex": app_id}} if "E2E" in app_id else {"application_id": app_id}
docs = list(db["documents"].find(query).sort("upload_timestamp", -1))
print(json.dumps(json.loads(json_util.dumps(docs)), indent=2))
