# read in csv as table with pandas
# the table headers incluse "initial_alias" and "converted_alias"
# the "converted alias" column contains the ensp ids
# the "initial alias" column contain the uniprot ids
# initial alias can be duplicated, while converted alias is unique
# we want to filter the table such that only the first occurence of each initial alias is kept

import pandas as pd

# read in the data
data = pd.read_csv('/home/nicolasbdva/gitRepos/biovis_challenge/biovis_challenge/data/gProfiler_hsapiens_6-27-2023_1-55-12 PM.csv')

# drop duplicates based on initial alias column
filtered_data = data.drop_duplicates(subset='initial_alias', keep='first')

# add the string "9606." to the beginning of each ensp id
filtered_data['converted_alias'] = "9606." + filtered_data['converted_alias'].astype(str)

# write the "converted_alias" column to a file separated by newlines
filtered_data['converted_alias'].to_csv('/home/nicolasbdva/gitRepos/biovis_challenge/biovis_challenge/data/group_A_converted.txt', index=False, header=False, sep='\n')
