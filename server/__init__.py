import os
import json
from flask import Flask, request

app = Flask(__name__, static_folder='../dist', static_url_path='/')
here = os.path.dirname(__file__)


## ROUTES
@app.route('/api/backendcounter', methods=['POST'])
def test():
    counter = int(request.form.to_dict()['counter'])
    return str(counter+1)

@app.route('/api/test_data_egograph',methods=['GET'])
def test_data_egograph():
    with open(os.path.join(here,"data","ego_example.json")) as f:
        data=json.load(f)
    return data

@app.route('/')
def index():
    return app.send_static_file('index.html')
