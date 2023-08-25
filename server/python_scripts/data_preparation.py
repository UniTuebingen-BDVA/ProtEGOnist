## read in ego_dict_deg2_{batchnumber}.pickle files and create intersections of each ego graph with each other, save the the top 50 intersections for each ego graph including the intersection size and the respective node ids

import pickle
import pathlib
from server.python_scripts.egoGraph import EgoGraph
from server.python_scripts.egoGraph import Intersection

# set path to data
path = pathlib.Path(__file__).parent.absolute()
path = path.parent / "data"


# for batch number (0,500,1000,1500,2000)
# read in ego_dict_deg2_{batchnumber}.pickle
# the read in dictionary is a dictionary of ego-graphs as defined in egoGraph.py
def generate_intersections_pickle():
    ego_dict = {}
    for batch in range(0, 2001, 500):
        print(batch)
        with open(path / f"ego_dict_deg2_{batch}.pickle", "rb") as f:
            # generate EgoGraph objects from the read in dictonary values
            ego_dict.update({k: EgoGraph(k, v) for k, v in pickle.load(f).items()})
    # create empty dictionary to save intersections
    intersections = {}

    # iterate over all ego graphs
    for ego in ego_dict:
        # create empty dictionary to save intersections of ego with all other ego graphs
        intersections[ego] = {}
        # iterate over all other ego graphs
        for other_ego in ego_dict:
            # if the other ego is not the ego itself
            if other_ego != ego:
                # calculate the intersection of the two ego graphs
                intersection: Intersection = ego_dict[ego].get_intersection(
                    ego_dict[other_ego]
                )
                # if the intersection is not empty
                if intersection:
                    # save the intersection size and the intersection node ids
                    intersections[ego][other_ego] = intersection
        # sort the intersections by jacard index
        intersections[ego] = dict(
            sorted(
                intersections[ego].items(), key=lambda x: x[1]["jaccard"], reverse=True
            )
        )
        top_50_keys = list(intersections[ego].keys())[:50]
        # save only the top 50 intersections for each ego graph and for those only save the ID and the corresponding jaccard index
        intersections[ego] = {
            k: v["jaccard"] for k, v in intersections[ego].items() if k in top_50_keys
        }

    # save the intersections dictionary as pickle file
    with open(path / "intersections_ego_deg2.pickle", "wb") as f:
        pickle.dump(intersections, f)


if __name__ == "__main__":
    ## test code
    generate_intersections_pickle()
    # read in intersections_ego_deg2.pickle
    # with open(path / "intersections_ego_deg2.pickle", "rb") as f:
    #     intersections = pickle.load(f)
    # # print the first 10 intersections
    # for ego in list(intersections.keys())[:10]:
    #     print(ego, intersections[ego])
