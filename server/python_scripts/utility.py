from itertools import combinations


def create_combinations(sample_list):
    """
    Creates combinations for elements in a list. Each combination includes 2 or more elements
    :param sample_list: list of elements to be combined
    :return: all possible combinations of elements in the list
    """
    list_combinations = list()
    for n in range(2, len(sample_list) + 1):
        combination = list(combinations(sample_list, n))
        list_combinations += combination
    return list_combinations


def tuple_size(curr_tuple):
    """
    gets the size of a tuple
    :param curr_tuple: current tuple
    :return: tuple length
    """
    return len(curr_tuple)


def create_intersections(set_dict):
    """
    Creates intersections for the values of a dictionary of arrays
    :param set_dict: dictionary of arrays
    :return: all intersections
    """
    intersections = {}
    combinations = create_combinations(list(set_dict.keys()))
    combinations.sort(key=tuple_size, reverse=True)
    used_ids = set()
    for combination in combinations:
        intersection = list(set_dict[combination[0]].intersection(*map(lambda id: set_dict[id], combination[1:-1])))
        intersections[','.join(list(combination))] = list(filter(lambda element: element not in used_ids, intersection))
        used_ids.update(intersection)
    return intersections
