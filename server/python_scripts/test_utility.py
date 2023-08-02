from server.python_scripts.utility import create_intersections, create_combinations


class TestEgoIntersections:
    def test_combinations(self):
        samples = ['a', 'b', 'c']
        result = create_combinations(samples)
        print(result)
        assert result == [('a', 'b', 'c'), ('a', 'b'), ('a', 'c'), ('b', 'c'), ('a',), ('b',), ('c',)]

    def test_intersections(self):
        set_dict = {'a': {'1', '2', '3'}, 'b': {'2', '3'}, 'c': {'1', '3', '4'}}
        result = create_intersections(set_dict)
        print(result)
        assert result == {'a,b,c': ['3'], 'a,b': ['2'], 'a,c': ['1'], 'b,c': [], 'a': [], 'b': [], 'c': ['4']}
