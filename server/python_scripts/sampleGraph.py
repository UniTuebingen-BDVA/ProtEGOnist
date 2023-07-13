import networkx as nx
from server.python_scripts.egoGraph import egoGraph
import random


# generate a dorogovtsev_goltsev_mendes_graph for the test data
def generateTestGraphData():
    G = nx.dorogovtsev_goltsev_mendes_graph(7)
    # add attributes to nodes with the name of the node being the id
    for node in G.nodes:
        G.nodes[node]["name"] = str(node)

    # print amount of nodes
    print("Graph nodes: ", G.number_of_nodes())
    # generate 40 unique random numbers between 0 and 9842 with fixed seed
    random.seed(42)
    random_numbers = random.sample(range(0, 1093), 40)

    ego_networks = {i: egoGraph(i, G) for i in random_numbers}
    return random_numbers, ego_networks


## test the function
if __name__ == "__main__":
    b, a = generateTestGraphData()
    # print the json from a random ego network
    print(b)
    print(a[b[0]].getGraphJSON())
