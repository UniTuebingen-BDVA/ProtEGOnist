import pathlib
import sys
from server import create_app

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else pathlib.Path(__file__).parent / "data"
    print("path", path)
    create_app(path).run(debug=True, port=5002)
