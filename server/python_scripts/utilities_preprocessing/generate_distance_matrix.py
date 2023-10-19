import time
import numpy as np
import argparse


def parse_ego_dict(path: str) -> dict:
    """
    Parse the ego dict from the given path.
    """
    ego_dict = np.load(path, allow_pickle=True).item()
    return ego_dict


def create_distance_matrix_from_dict(dict) -> np.ndarray:
    """
    Create a distance matrix from a dictionary of ego graphs.
    """
    # create a list of all nodes
    nodes = list(dict.keys())
    # create a distance matrix
    distance_matrix = np.ones((len(nodes), len(nodes)))
    # fill the distance matrix
    for i in range(len(nodes)):
        for j in range(i + 1, len(nodes)):
            intersection_size = len(
                set(dict[nodes[i]]["nodes"]).intersection(
                    set(dict[nodes[j]]["nodes"]))
            )
            union_size = len(
                set(dict[nodes[i]]["nodes"]).union(set(dict[nodes[j]]["nodes"])))
            distance_matrix[i, j] = intersection_size / union_size
            distance_matrix[j, i] = distance_matrix[i, j]
    return distance_matrix, nodes


def main():
    # Create argparser
    parser = argparse.ArgumentParser(
        description="Create distance matrix from ego graphs.")
    # Add arguments to the parser
    parser.add_argument(
        "-i",
        "--input",
        type=str,
        help="Path to the ego dict.",
        default="ego_dict_as_pickle.npy",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=str,
        help="Path to the output distance matrix.",
        default="distance_matrix.txt",
    )
    # Parse the arguments
    args = parser.parse_args()

    start_time = time.time()
    ego_dict = parse_ego_dict(args.input)
    print("Loading finished --- %s seconds ---" % (time.time() - start_time))

    print(len(ego_dict.keys()))
    distance_matrix, nodes = create_distance_matrix_from_dict(ego_dict)
    print("Process finished --- %s seconds ---" % (time.time() - start_time))

    # export the distance matrix
    np.savetxt(args.output, distance_matrix,
               delimiter="\t", header="nodes\t" + "\t".join(nodes))


if __name__ == "__main__":
    main()
