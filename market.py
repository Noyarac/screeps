import requests
import json
import math
import re
from cred import AUTH_DATA

def distance_between_rooms(roomName1, roomName2):
    roomList = []
    for room in (roomName1, roomName2):
        coord = re.findall(r'^([WE])(\d{1,2})([NS])(\d{1,2})', room)
        WE_LETTER, WE_INDEX, NS_LETTER, NS_INDEX = coord[0]
        WE_INDEX = int(WE_INDEX)
        NS_INDEX = int(NS_INDEX)
        roomList.append((((0 if WE_LETTER == "W" else 1) * 61 + ((60 - WE_INDEX) if WE_LETTER == "W" else WE_INDEX)),
                    ((0 if NS_LETTER == "N" else 1) * 61 + ((60 - NS_INDEX) if NS_LETTER == "N" else NS_INDEX))))
    return max(
        min(
            abs(roomList[0][0] - roomList[1][0]),
            122 -abs(roomList[0][0] - roomList[1][0]),
            ),
        min(
            abs(roomList[0][1] - roomList[1][1]),
            122 -abs(roomList[0][1] - roomList[1][1]),
        )
    )

def calculate_energy_transaction_cost(amount, roomName1, roomName2):
    return math.ceil(amount * (1 - math.exp(-distance_between_rooms(roomName1, roomName2)/30)))

response = requests.post('https://screeps.com/api/auth/signin', json=AUTH_DATA)
auth_token = response.json().get('token')
headers = {
    'X-Token': auth_token,
}

API_URL = 'https://screeps.com/api/game/market/orders?shard=shard3&resourceType=energy'
response = requests.get(API_URL, headers=headers)
if response.status_code == 200:
    market_orders = response.json()
else:
    print(f"Failed to retrieve market orders. Status code: {response.status_code}")

def energy_real_cost_per_unit(order):
    return order["remainingAmount"] * order["price"] / (order["remainingAmount"] - calculate_energy_transaction_cost(order["remainingAmount"], "W53N7", order["roomName"]))

energy_orders = [(order["_id"], order["remainingAmount"], energy_real_cost_per_unit(order)) for order in market_orders["list"] if order["type"] == "sell"]
energy_orders.sort(key= lambda x: x[2])
for id, amount, price in energy_orders:
    print(f"{id=}, {price=}, {amount=}")

print("")
TARGET_RESOURCE = "GO"
API_URL = f'https://screeps.com/api/game/market/orders?shard=shard3&resourceType={TARGET_RESOURCE}'
response = requests.get(API_URL, headers=headers)
if response.status_code == 200:
    market_orders = response.json()
else:
    print(f"Failed to retrieve market orders. Status code: {response.status_code}")

def get_total_energy_price(quantity, prices, price_index = 0, total_price = 0):
    AMOUNT = 1
    UNIT_PRICE = 2
    if quantity == 0:
        return total_price
    
    min_quantity = min(quantity, prices[price_index][AMOUNT])
    total_price += min_quantity * prices[price_index][UNIT_PRICE]
    quantity -= min_quantity
    return get_total_energy_price(quantity, prices, price_index + 1, total_price)


def get_real_benefice_per_unit(order):
    energy_to_spend = calculate_energy_transaction_cost(order["remainingAmount"], "W53N7", order["roomName"])
    return (order["remainingAmount"] * order["price"] - get_total_energy_price(energy_to_spend, energy_orders))/ order["remainingAmount"]

go_orders = [(order["_id"], order["remainingAmount"], get_real_benefice_per_unit(order)) for order in market_orders["list"] if order["type"] == "buy"]
go_orders.sort(reverse = True, key = lambda x: x[2])
for id, amount, price in go_orders:
    print(f"{id=}, {price=}, {amount=}, total={price*amount}")

