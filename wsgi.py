import pathlib
from server import create_app

if __name__ == "__main__":
    create_app(pathlib.Path(__file__).parent / "server").run(debug=True)
