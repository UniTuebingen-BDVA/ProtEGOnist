from setuptools import setup

setup(
    name='server',
    packages=['server','python_scripts'],
    include_package_data=True,
    install_requires=[
        'flask',
    ],
    package_data={'server': ['data/*']},
)