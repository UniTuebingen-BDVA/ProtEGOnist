### 1) Basic Requirements
Python and pip version should be >= 3.10.5 and >= 22.1.1 respectively.

### 2) Setting up a Virtual Environment (venv) in Python
cd to the directory where the venv should be located and create the venv
```console
user@example:~$ cd <path/to/project>
user@example:~/path/to/project$ virtualenv <your-venv>
```
### 3) Install required Python packages
Install required Python packages by referring to the requirements.txt-file.
```console
user@example:~$ source venv/bin/activate
(<your-venv>) user@example:~$ pip install -r requirements.txt
(<your-venv>) user@example:~$ pip install . 
```
### 4) Install required javascript packages
cd to the project directory
```console
user@example:~/path/to/project$ yarn install
```
## Running the tool
Activate venv and run the python file which will open the web application in a new browser window. 
```console
user@example:~$ source <your-venv>/bin/activate
(<your-venv>) user@example:~$ yarn run dev
```