import networkx as nx

# Read the graph from the GraphML file
graph = nx.read_graphml('/Users/pacha/Documents/github_projects/Biovis-Challenge23/BiovisChallenge2023/server/data/graphml_string_cleaned.graphml')

# Write the graph to a TSV file
nx.write_weighted_edgelist(graph, 'test.tsv', delimiter='\t')

