import torch
import torch.nn as nn



# The Regression model's definition
class CNNRegressor(nn.Module):
    def __init__(self):
        super(CNNRegressor, self).__init__()
        self.cnn_layer1 = nn.Sequential(nn.Conv2d(1, 16, kernel_size=3, padding='valid'), nn.ReLU(), nn.Dropout(0.1),
                                        nn.BatchNorm2d(16), nn.MaxPool2d(kernel_size=2))
        self.cnn_layer2 = nn.Sequential(nn.Conv2d(16, 32, kernel_size=3, padding='valid'), nn.ReLU(), nn.Dropout(0.2),
                                        nn.BatchNorm2d(32), nn.MaxPool2d(kernel_size=2))
        self.linear_layer1 = nn.Linear(32 * 30 * 6 + 8, 64)
        self.dropout1 = nn.Dropout(0.5)
        self.activ1 = nn.ReLU()
        self.linear_layer_p = nn.Linear(64, 32)
        self.dropout_p = nn.Dropout(0.5)
        self.activ_p = nn.ReLU()
        self.linear_layer2 = nn.Linear(32, 2)
        self.activ2 = nn.Sigmoid()

    def forward(self, images, features):
        cnn2 = self.cnn_layer2(self.cnn_layer1(images.unsqueeze(1)))
        cnn_vec = cnn2.reshape(cnn2.shape[0], -1)
        out = self.dropout1(self.activ1(self.linear_layer1(torch.cat((cnn_vec, features), dim=1))))
        return self.activ2(self.linear_layer2(self.activ_p(self.dropout_p(self.linear_layer_p(out)))))


# The neural classification model
class CNNClassifier(nn.Module):
    def __init__(self, num_classes=10):
        super(CNNClassifier, self).__init__()
        self.cnn_layer1 = nn.Sequential(nn.Conv2d(1, 16, kernel_size=3, padding='valid'), nn.ReLU(), nn.Dropout(0.1),
                                        nn.BatchNorm2d(16), nn.MaxPool2d(kernel_size=2))
        self.cnn_layer2 = nn.Sequential(nn.Conv2d(16, 32, kernel_size=3, padding='valid'), nn.ReLU(), nn.Dropout(0.2),
                                        nn.BatchNorm2d(32), nn.MaxPool2d(kernel_size=2))
        self.linear_layer1 = nn.Linear(32 * 30 * 3 + 7, 64)
        self.dropout1 = nn.Dropout(0.5)
        self.activ1 = nn.ReLU()
        self.linear_layer_p = nn.Linear(64, 32)
        self.dropout_p = nn.Dropout(0.5)
        self.activ_p = nn.ReLU()
        self.linear_layer2 = nn.Linear(32, num_classes)

    def forward(self, images, features):
        cnn2 = self.cnn_layer2(self.cnn_layer1(images.unsqueeze(1)))
        cnn_vec = cnn2.reshape(cnn2.shape[0], -1)
        out = self.dropout1(self.activ1(self.linear_layer1(torch.cat((cnn_vec, features), dim=1))))
        out2 = self.linear_layer2(self.activ_p(self.dropout_p(self.linear_layer_p(out))))
        return out2

print("Hello Pytorch")