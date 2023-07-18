### 1) Basic Requirements
A conda/miniconda installation, the conda environment will be 3.11

### 2) Setting up the conda environment
cd to the root of the project
```console
user@example:~/path/to/project$ conda env create -f requirements.yml
user@example:~/path/to/project$ conda activate biovischallenge
```
### 3) Install required javascript packages
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
