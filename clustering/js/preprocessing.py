import pandas as pd

if __name__ == "__main__":
    filename = 'preprocessed_kingscourt.csv'
    df = pd.read_csv('datasets_Kingscourt_Kingscourt_Piquant_wt-percent.csv')
    df.columns = ['X','Y_c','Z','Al', 'Si', 'S', 'K', 'Ca', 'Ti', 'V', 'Mn', 'Fe', 'Ni', 'Cu', 'Zn', 'As',
                     'Y', 'Sr', 'Zr', 'Pb', 'Rb', 'Bi', 'U', 'Co']

    features = df[['Al', 'Si', 'S', 'K', 'Ca', 'Ti', 'V', 'Mn', 'Fe', 'Ni', 'Cu', 'Zn', 'As',
                     'Y', 'Sr', 'Zr', 'Pb', 'Rb', 'Bi', 'U', 'Co']]

    df['maxElement'] = features.idxmax(axis=1)
    df['minElement'] = features.idxmin(axis=1)
    df['maxValue'] = features.max(axis=1)
    df['minValue'] = features.min(axis=1)

    df.to_csv(filename, sep=',', encoding='utf-8', index=False)