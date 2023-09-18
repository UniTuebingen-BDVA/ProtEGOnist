from setuptools import setup,find_packages

setup(
    name='server',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'flask',
    ],
    package_data={'server': ['data/*']},
)