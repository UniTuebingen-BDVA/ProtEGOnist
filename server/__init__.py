import os
from flask import Flask, request

app = Flask(__name__, static_folder='../dist', static_url_path='/')
here = os.path.dirname(__file__)


## ROUTES
@app.route('/api/backendcounter', methods=['POST'])
def test():
    counter = int(request.form.to_dict()['counter'])
    return str(counter+1)


@app.route('/')
def index():
    return app.send_static_file('index.html')
