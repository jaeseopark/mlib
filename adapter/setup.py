from setuptools import setup, find_packages

setup(
    name="adapter",
    packages=find_packages(exclude=("test",)),
    python_requires=">=3.8"
)
