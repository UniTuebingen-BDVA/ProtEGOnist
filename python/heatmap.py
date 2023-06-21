import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# Read the data
df:pd.DataFrame = pd.read_csv('/home/nicolasbdva/gitRepos/biovis_challenge/biovis_challenge/data/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt', sep="\t", index_col=0, header=0, engine="python")
print(df.shape)
df = df.dropna(axis=1, how='all')
print(df.shape)
df.fillna(0, inplace=True)

print(df.head(5))

cg = sns.clustermap(df, cmap='RdBu_r', col_cluster=False,center=0, figsize=(20, 20), vmin=-5 , vmax=5, z_score=1)
plt.show()