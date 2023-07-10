# use pandas to read in a dataframe of cell lines as rows and proteins as columns
# extract those columns for which more than: A 90%, B 20-90%, C 0-20% of the values are not missing 

import pandas as pd

# read in the data
df = pd.read_csv("/home/nicolasbdva/gitRepos/biovis_challenge/biovis_challenge/data/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt", sep='\t', header=0, index_col=0)

# get the number of rows and columns
nrows = df.shape[0]
ncols = df.shape[1]

# get the number of missing values per column
n_missing = df.isnull().sum(axis=0)

# get the percentage of missing values per column
p_missing = n_missing / nrows

# get the number of columns with less than 10% missing values
n_90 = sum(p_missing < 0.10)

# get the number of columns with between 10% and 80% missing values
n_2080 = sum((p_missing >= 0.10) & (p_missing < 0.80))

# get the number of columns with more than 80% missing values
n_80 = sum(p_missing >= 0.80)

# get the names of the columns with less than 10% missing values
cols_90 = p_missing[p_missing < 0.10].index.tolist()

# get the names of the columns with between 10% and 80% missing values
cols_2080 = p_missing[(p_missing >= 0.10) & (p_missing < 0.80)].index.tolist()

# get the names of the columns with more than 80% missing values
cols_20 = p_missing[p_missing >= 0.80].index.tolist()

print( "Number of columns with less than 10% missing values: " + str(n_90) )
print( "Number of columns with between 10% and 80% missing values: " + str(n_2080) )
print( "Number of columns with more than 80% missing values: " + str(n_80) )

#write the ids of cols_90, cols_2080 and cols_20 to files
with open("/home/nicolasbdva/gitRepos/biovis_challenge/biovis_challenge/data/group_A.txt", "w") as f:
    for col in cols_90:
        f.write(col.split(";")[0] + "\n")

with open("/home/nicolasbdva/gitRepos/biovis_challenge/biovis_challenge/data/group_B.txt", "w") as f:
    for col in cols_2080:
        f.write(col.split(";")[0] + "\n")

with open("/home/nicolasbdva/gitRepos/biovis_challenge/biovis_challenge/data/group_C.txt", "w") as f:
    for col in cols_20:
        f.write(col.split(";")[0] + "\n")
