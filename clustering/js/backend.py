from flask import Flask
from flask_cors import CORS
from flask import request
import json

import pandas as pd
import streamlit as st
import plotly.express as px
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import AgglomerativeClustering
import numpy as np
import plotly.figure_factory as ff

app = Flask(__name__)
CORS(app)

df = pd.DataFrame()
scaled_df = pd.DataFrame()
root_path = ""

def normalize(original_df):
    to_scale = StandardScaler()
    new_df = to_scale.fit_transform(original_df)
    return new_df

@app.route('/')
def hello():
    # Read the data into the dataframe on page load
    global df
    global scaled_df
    df = pd.read_csv(root_path + 'preprocessed_kingscourt.csv')
    features = df[['Al', 'Si', 'S', 'K', 'Ca', 'Ti', 'V', 'Mn', 'Fe', 'Ni', 'Cu', 'Zn', 'As',
                   'Y', 'Sr', 'Zr', 'Pb', 'Rb', 'Bi', 'U', 'Co']]
    scaled_df = normalize(features)
    return "hi"

@app.route('/kmeans')
def kmeans():
    K = int(request.args.get('K'))
    pca = request.args.get('pca')
    variance = float(request.args.get('variance'))

    if pca == "1":
        pca = PCA(variance)
        reduced_data = pca.fit_transform(scaled_df)
        clusters_data = reduced_data
    else:
        clusters_data = scaled_df

    k_means = KMeans(n_clusters=K)
    y = k_means.fit_predict(clusters_data)

    df['Cluster'] = y
    df['Cluster'] = df['Cluster'].apply(str)

    retVal = dict()
    for i in range(K):
        subset = df[(df["Cluster"] == str(i))]
        inner= dict()
        inner['x'] = subset['X'].tolist()
        inner['y'] = subset['Y_c'].tolist()
        inner['z'] = subset['Z'].tolist()
        retVal[str(i)] = inner

    return json.dumps(retVal)

@app.route('/hierarchical')
def hierarchical():
    num = int(request.args.get('num'))
    linkage_type = request.args.get('linkage')
    cluster = AgglomerativeClustering(n_clusters=num, affinity='euclidean', linkage=linkage_type)
    predicted_clusters = cluster.fit_predict(scaled_df)
    df['hierarchical_cluster'] = predicted_clusters
    df['hierarchical_cluster'] = df['hierarchical_cluster'].apply(str)

    retVal = dict()
    for i in range(num):
        subset = df[(df["hierarchical_cluster"] == str(i))]
        inner = dict()
        inner['x'] = subset['X'].tolist()
        inner['y'] = subset['Y_c'].tolist()
        inner['z'] = subset['Z'].tolist()
        retVal[str(i)] = inner

    return json.dumps(retVal)

@app.route('/none')
def maxmin():
    maxOrMin = request.args.get('type')
    if maxOrMin == "min":
        column = np.asarray(df["minElement"].tolist())
        column_name = "minElement"
    else:
        column = np.asarray(df["maxElement"].tolist())
        column_name = "maxElement"

    uniqueValues = np.unique(column)

    retVal = dict()
    for i in range(len(uniqueValues)):
        subset = df[(df[column_name] == uniqueValues[i])]
        inner = dict()
        inner['x'] = subset['X'].tolist()
        inner['y'] = subset['Y_c'].tolist()
        inner['z'] = subset['Z'].tolist()
        retVal[uniqueValues[i]] = inner
    retVal["keys"] = list(uniqueValues)
    return json.dumps(retVal)

if __name__ == '__main__':
    app.run()
