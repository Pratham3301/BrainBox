import os

import torchvision
from torch.utils.data import DataLoader
from torchvision import transforms


def get_cifar10_loaders(
    data_dir: str = "cifar_data/", 
    batch_size: int = 128
) -> tuple[DataLoader, DataLoader]:
    """
    Downloads (if necessary) and returns PyTorch DataLoaders for CIFAR-10.
    """
    os.makedirs(data_dir, exist_ok=True)
    
    # Standard normalization for CIFAR-10
    transform_train = transforms.Compose([
        transforms.RandomCrop(32, padding=4),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010)),
    ])

    transform_test = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010)),
    ])

    trainset = torchvision.datasets.CIFAR10(
        root=data_dir, train=True, download=True, transform=transform_train
    )
    trainloader = DataLoader(
        trainset, batch_size=batch_size, shuffle=True, num_workers=0
    )

    testset = torchvision.datasets.CIFAR10(
        root=data_dir, train=False, download=True, transform=transform_test
    )
    testloader = DataLoader(
        testset, batch_size=batch_size, shuffle=False, num_workers=0
    )

    return trainloader, testloader
