# read first line of tab seperated file and save it as a list
# then split each entry of the list by ";" and save the first entry to a file

# read file
file = open("/home/nicolasbdva/gitRepos/biovis_challenge/biovis_challenge/data/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt", "r")
# read first line
line = file.readline()
# split line by tab
line = line.split("\t")
# split each entry by ";"
line = [x.split(";") for x in line]
# save first entry of each list to file
with open("uniprotIDs.txt", "w") as f:
    for x in line:
        f.write(x[0] + "\n")

