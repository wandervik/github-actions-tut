import json
import sys

print(sys.argv)

def toJson(data: str, delim=' | '):
  return json.dumps(data.split(delim))

if len(sys.argv) == 2:
  print(toJson(sys.argv[1]))
elif len(sys.argv) == 3:
  print(toJson(sys.argv[1], sys.argv[2]))
else:
  sys.exit(1)

sys.exit(0)