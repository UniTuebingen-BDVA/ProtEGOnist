import argparse
import json
from typing import Iterator, List, Dict


def read_csv(file_name: str) -> Iterator[List[str]]:
    with open(file_name, 'r') as f:
        header = True
        for line in f:
            data = line.strip().split('\t')
            if len(data) < 2:
                continue
            if header:
                header = False
                continue
            yield data


def get_protein_set(file_name: str) -> Dict[str, Dict[str, List[str]]]:
    """Create a dictionary of protein sets.

    The keys of the dictionary are protein gene names, and the values are dictionaries
    with three keys: 'tissue', "drug-name" and 'cancer-gene'. The value of 'tissue' and 'drug-name'
    are a list of tissues in which the protein is found as key gene and the list of drugs targeting this 
    protein , and the value of 'cancer-gene' is if the gene is known as cancer-key-gene.

    Parameters
    ----------
    file_name : str
        The name of the file containing the protein information.

    Returns
    -------
    Dict[str, Dict[str, List[str]]]
        A dictionary of protein sets.
    """
    protein_set = {}
    for data in read_csv(file_name):
        if data[5] not in protein_set.keys():
            protein_set[data[5]] = {
                'tissue': [data[13]],
                'cancer-gene': data[19],
                'drug-name': [data[1]]
            }
        else:
            protein_set[data[5]]['tissue'].append(data[13])
            protein_set[data[5]]['tissue'] = list(
                set(protein_set[data[5]]['tissue']))
            protein_set[data[5]]['drug-name'].append(data[1])
            protein_set[data[5]]['drug-name'] = list(
                set(protein_set[data[5]]['drug-name']))

    return protein_set


def get_gene_mapper(file_name: str) -> Dict[str, str]:
    """Create a dictionary mapping protein gene names to UniProt IDs.

    Parameters
    ----------
    file_name : str
        The name of the file containing the mapping information.

    Returns
    -------
    Dict[str, str]
        A dictionary mapping protein gene names to UniProt IDs.
    """
    mapper = {}
    for data in read_csv(file_name):
        # print(data)
        mapper[data[4]] = data[-1]
    return mapper


def main():
    # get argparser
    parser = argparse.ArgumentParser(
        description='Extract all proteins from given csv')
    parser.add_argument('file_name', type=str, help='The name of the csv file')
    parser.add_argument('output_name', type=str,
                        help='The name of the output json file')
    parser.add_argument('-m', "--map", type=str,
                        help='The name of the file used to map proteins to UniProt IDs')
    args = parser.parse_args()

    # get protein set
    protein_set = get_protein_set(args.file_name)

    # map protein gene names to UniProt IDs
    mapper = get_gene_mapper(args.map)
    # Export mapper
    with open('mapper.json', 'w') as f:
        json.dump(mapper, f)
    # add UniProt IDs to protein set
    for gene_name in protein_set.keys():
        if gene_name in mapper.keys():
            protein_set[gene_name]['uniprot-id'] = mapper[gene_name]
        else:
            protein_set[gene_name]['uniprot-id'] = None
    # Get size of protein set
    print(len(protein_set.keys()))
    # Export protein set
    with open(args.output_name, 'w') as f:
        json.dump(protein_set, f)


main()
