# read in the author json file as recieved from openAlex and parse it. find each author and get their affiliation and the affiliations country

import json
import codecs
import networkx as nx


def parseAuthorJson():
    # open the json file
    # load the json file
    data = json.load(codecs.open("openAlexIEEEquery.json", "r", "utf-8-sig"))
    # each paper has an enhtry publication year which is the year the paper was published
    # get the list of authors the data is a list of queried papers and each paper has an entry 'authorships' which is a list of authors
    # each authorship has an entry "raw_author_name" which is the authors name, an entry 'author' which contains the authors full name and an entry institutions which is a list of the authors institutions
    # each institution has an entry 'display_name' which is the name of the institution and an entry 'country_code' which is the country the institution is in

    # create a list of authors
    authors = {}
    # loop through each paper
    for paper in data["results"]:
        # loop through each authorship
        for authorship in paper["authorships"]:
            # get the authors name
            publicationYear = paper["publication_year"]
            authorRawName = authorship["raw_author_name"]
            authorName = authorship["author"]["display_name"]
            # get the authors institutions
            institutions = authorship["institutions"]
            # loop through each institution
            for institution in institutions:
                # get the institutions name
                institutionName = institution["display_name"]
                # get the institutions country
                country = institution["country_code"]
                # create a tuple of the authors name, the institutions name and the institutions country
                author = {
                    "raw_name": authorRawName,
                    "name": authorName,
                    "institution": institutionName,
                    "institutionCountry": country,
                    "latestPublication": publicationYear,
                }
                # add the author to the list of authors
                if authorName not in authors:
                    authors[author["name"]] = author
                else:
                    # check if year is more recent than the one already in the list
                    if authors[author["name"]]["latestPublication"] < publicationYear:
                        authors[author["name"]] = author
    # return the list of authors
    return authors


def parseNetworkJson():
    # parse the IEEEvos.json file.
    # the json contains one entry, network, this consists of items and links
    # items correspond to an author.
    # links correspond to coauthorship between two authors-
    # each author entry has an id which is the internal id, a label which correspons to the authors name and a weights object in which there are the "Documents" and the "Citations" which are the number of documents and citations the author has
    # each links object has a "source_id" and a "target_id" which are the ids of the authors and a "strength" which is the number of documents the authors have coauthored

    # parse the json file and get the network also read in the authorsIEEEcleaned.json file and add the Documents and Citations to each author
    # open the json file
    # load the json file
    path = "server/data/IEEEcoAuthor/"
    data = json.load(codecs.open(path + "IEEEvos.json", "r", "utf-8-sig"))
    Metadata = json.load(
        codecs.open(path + "authorsIEEEcleaned.json", "r", "utf-8-sig")
    )
    # get the network
    network = data["network"]
    # get the items
    items = network["items"]
    # get the links
    links = network["links"]

    # loop through each link
    # generate a networkx graph from the links and items
    G = nx.Graph()

    # loop through each item and add them to the graph
    for item in items:
        # get the id
        id = item["id"]
        # get the label and make it capitalised
        labelList = item["label"].split(" ")
        labelListCapitalised = [label.capitalize() for label in labelList]
        label = " ".join(labelListCapitalised)
        # get the documents
        documents = item["weights"]["Documents"]
        # get the citations
        citations = item["weights"]["Citations"]

        # check if the author is in the Metadata
        if label not in Metadata.keys():
            continue
        full_name = Metadata[label]["name"]
        institution = Metadata[label]["institution"]
        institutionCountry = Metadata[label]["institutionCountry"]
        # add documents and citations to the Metadata
        Metadata[label]["documents"] = documents
        Metadata[label]["citations"] = citations
        # write the Metadata to a json file
        # add the node to the graph
        G.add_node(
            label,
            label=label,
            documents=documents,
            citations=citations,
            name=full_name,
            institution=institution,
            institutionCountry=institutionCountry,
        )
    print(nx.info(G))

    for link in links:
        # get the source and target ids

        source = link["source_id"]
        target = link["target_id"]
        # get the name of the source and target
        source_name = items[source - 1]["label"]
        target_name = items[target - 1]["label"]
        source_nameList = source_name.split(" ")
        source_nameListCapitalised = [label.capitalize() for label in source_nameList]
        source_name = " ".join(source_nameListCapitalised)
        target_nameList = target_name.split(" ")
        target_nameListCapitalised = [label.capitalize() for label in target_nameList]
        target_name = " ".join(target_nameListCapitalised)
        # get the strength
        strength = link["strength"]
        # check if both source and target are in the graph
        if source_name not in G.nodes() or target_name not in G.nodes():
            continue
        # add the edge to the graph
        G.add_edge(source_name, target_name, weight=strength)

    # print key stats about the graph
    print(nx.info(G))
    # write the Metadata to a json file
    with open(path + "authorsIEEEcleanedExtended.json", "w") as outfile:
        json.dump(Metadata, outfile)
    with open(path + "authorsIEEEcleanedExtended.csv", "w") as outfile:
        outfile.write(
            "nodeID;raw_name;name;institution;institutionCountry;latestPublication;Documents;Citations\n"
        )
        for author in Metadata:
            # check if the author is in the graph
            if author not in G.nodes():
                continue
            outfile.write(
                "{};{};{};{};{};{};{};{}\n".format(
                    Metadata[author]["name"],
                    Metadata[author]["raw_name"],
                    Metadata[author]["name"],
                    Metadata[author]["institution"],
                    Metadata[author]["institutionCountry"],
                    Metadata[author]["latestPublication"],
                    Metadata[author]["documents"],
                    Metadata[author]["citations"],
                )
            )
    # write the graph to a graphml file
    nx.write_graphml(G, path + "IEEEGraph.graphml")


# parseAuthorJson()
if __name__ == "__main__":
    # result = parseAuthorJson()
    # print(len(result))
    # # print the first 10 authors
    # for i in list(result.keys())[0:10]:
    #     print(result[i])
    # # write the authors to a json file
    # with open("authorsIEEEcleaned.json", "w") as outfile:
    #     json.dump(result, outfile)
    # # write the authors to a csv file
    # # the headers for the tsv file should be "raw_name", "name", "institution", "institutionCountry", "latestPublication"
    # with open("authorsIEEEcleaned.csv", "w") as outfile:
    #     outfile.write(
    #         "raw_name;name;institution;institutionCountry;latestPublication\n"
    #     )
    #     for author in result:
    #         outfile.write(
    #             "{};{};{};{};{}\n".format(
    #                 result[author]["raw_name"],
    #                 result[author]["name"],
    #                 result[author]["institution"],
    #                 result[author]["institutionCountry"],
    #                 result[author]["latestPublication"],
    #             )
    #         )
    parseNetworkJson()
