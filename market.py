import requests
import math
import re
from cred import AUTH_DATA
from functools import reduce
from time import sleep

RESOURCES_ALL = ("power", "H", "O", "U", "K", "L", "Z", "X", "G", "OH", "ZK", "UL", "UH", "UO", "KH", "KO", "LH", "LO", "ZH", "ZO", "GH", "GO", "UH2O", "UHO2", "KH2O", "KHO2", "LH2O", "LHO2", "ZH2O", "ZHO2", "GH2O", "GHO2", "XUH2O", "XUHO2", "XKH2O", "XKHO2", "XLH2O", "XLHO2", "XZH2O", "XZHO2", "XGH2O", "XGHO2", "ops", "silicon", "metal", "biomass", "mist", "utrium_bar", "lemergium_bar", "zynthium_bar", "keanium_bar", "ghodium_melt", "oxidant", "reductant", "purifier", "battery", "composite", "crystal", "liquid", "wire", "switch", "transistor", "microchip", "circuit", "device", "cell", "phlegm", "tissue", "muscle", "organoid", "organism", "alloy", "tube", "fixtures", "frame", "hydraulics", "machine", "condensate", "concentrate", "extract", "spirit", "emanation", "essence")

response = requests.post('https://screeps.com/api/auth/signin', json=AUTH_DATA)
auth_token = response.json().get('token')
headers = {
    'X-Token': auth_token,
}


def register_orders(orders1, orders2):
    global headers
    payload = {"shard": "shard3", "expression": f"Memory.market.push({orders1});Memory.market.push({orders2})"}
    print("DEBUG")
    print(payload)
    response = requests.post('https://screeps.com/api/user/console?shard=shard3', headers=headers, data=payload)
    if response.status_code == 200:
        headers = {
            'X-Token': response.headers._store["x-token"][1],
        }
        sleep((len(orders1) + 1) * 10 * 3)
    else:
        print(f"Failed to register orders to the game. Status code: {response.status_code}")


    

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

def get_orders(target_resource):
        global headers
        API_URL = f'https://screeps.com/api/game/market/orders?shard=shard3&resourceType={target_resource}'
        response = requests.get(API_URL, headers=headers)
        if response.status_code == 200:
            market_orders = response.json()
            headers = {
                'X-Token': response.headers._store["x-token"][1],
            }
        else:
            print(f"Failed to retrieve market orders. Status code: {response.status_code}")
            market_orders = None
        return market_orders

def energy_real_cost_per_unit(order):
    return order["remainingAmount"] * order["price"] / (order["remainingAmount"] - calculate_energy_transaction_cost(order["remainingAmount"], "W53N7", order["roomName"]))

def get_total_energy_price(quantity, prices, price_index = 0, total_price = 0, orders_to_deal = None):
    if orders_to_deal == None:
        orders_to_deal = []
    ID = 0
    AMOUNT = 1
    UNIT_PRICE = 2
    if quantity == 0:
        return total_price, orders_to_deal
    
    min_quantity = min(quantity, prices[price_index][AMOUNT])
    total_price += min_quantity * prices[price_index][UNIT_PRICE]
    quantity -= min_quantity
    orders_to_deal.append([prices[price_index][ID], min_quantity])
    return get_total_energy_price(quantity, prices, price_index + 1, total_price, orders_to_deal[:])

def get_adjusted_price_per_unit(order, energy_orders):
    if order["remainingAmount"] == 0:
        return math.inf
    energy_to_spend = calculate_energy_transaction_cost(order["remainingAmount"], "W53N7", order["roomName"])
    if order["type"] == "buy":
        return (order["remainingAmount"] * order["price"] - get_total_energy_price(energy_to_spend, energy_orders)[0])/ order["remainingAmount"]
    if order["type"] == "sell":
        return (order["remainingAmount"] * order["price"] + get_total_energy_price(energy_to_spend, energy_orders)[0])/ order["remainingAmount"]

def find_free_money(price = None):
    global headers
    energy_orders = get_adjusted_energy_sell_orders() if price == None else [("reserve", 100000000, price, "W53N7")]
    for target_resource in RESOURCES_ALL:
        API_URL = f'https://screeps.com/api/game/market/orders?shard=shard3&resourceType={target_resource}'
        response = requests.get(API_URL, headers=headers)
        if response.status_code == 200:
            market_orders = response.json()
            headers = {
               'X-Token': response.headers._store["x-token"][1],
            }
        else:
            print(f"Failed to retrieve market orders. Status code: {response.status_code}")
        selling_orders = [(order["_id"], order["remainingAmount"], get_adjusted_price_per_unit(order, energy_orders), order["roomName"]) for order in market_orders["list"] if order["type"] == "sell" and order["remainingAmount"] > 0]
        buying_orders = [(order["_id"], order["remainingAmount"], get_adjusted_price_per_unit(order, energy_orders), order["roomName"]) for order in market_orders["list"] if order["type"] == "buy" and order["remainingAmount"] > 0]

        selling_orders.sort(key = lambda x: x[2])
        buying_orders.sort(key = lambda x: x[2], reverse=True)
        
        if len(selling_orders) > 0 and len(buying_orders) > 0 and selling_orders[0][2] < buying_orders[0][2]:
            targeted_quantity = min(2500, selling_orders[0][1], buying_orders[0][1])
            energy_required_for_both = calculate_energy_transaction_cost(targeted_quantity, "W53N7", selling_orders[0][3]) + calculate_energy_transaction_cost(targeted_quantity, "W53N7", buying_orders[0][3])
            deals_to_buy_energy: list[list[str|int]] = get_total_energy_price(energy_required_for_both, energy_orders)[1]
            deals_to_buy_energy.append([selling_orders[0][0], targeted_quantity])
            register_orders(deals_to_buy_energy, [[buying_orders[0][0], targeted_quantity]])
            break
    print("Finished")

def get_best_deals(target_resource, sell_or_buy, price = None):
    market_orders = get_orders(target_resource)
    energy_orders = get_adjusted_energy_sell_orders() if price == None else [("reserve", 100000000, price, "W53N7")]
    orders = [(order["_id"], order["remainingAmount"], get_adjusted_price_per_unit(order, energy_orders)) for order in market_orders["list"] if order["type"] == sell_or_buy]
    if sell_or_buy ==  "buy":
        orders.sort(reverse = True, key = lambda x: x[2])
    else:
        orders.sort(key = lambda x: x[2])
    # for id, amount, price in orders:
    #     print(f"{id=}, {price=}, {amount=}, total={price*amount}")
    return orders

def get_adjusted_energy_sell_orders():
    market_orders = get_orders("energy")
    energy_orders = [(order["_id"], order["remainingAmount"], energy_real_cost_per_unit(order), order["roomName"]) for order in market_orders["list"] if order["type"] == "sell"]
    energy_orders.sort(key= lambda x: x[2])
    # for id, amountAvailable, price, roomName in energy_orders:
    #     print(f"{id=}, {price=}, {amountAvailable=}, {1000 - calculate_energy_transaction_cost(1000, 'W53N7', roomName)}")
    return energy_orders

reserve_price = None
while True:
    print("Started")
    x_best_deal = get_best_deals("X", "buy", reserve_price)[0]
    if x_best_deal[2] > 150:
        print("faut vendre 100 X", x_best_deal)


    energy_best_deal = get_best_deals("energy", "sell")[0]
    if energy_best_deal[2] < 200:
        print(energy_best_deal)
    else:
        print("No cheap energy")
    find_free_money(reserve_price)
    sleep(5)