import telegram_send
import time
from pyfiglet import Figlet

f = Figlet()

while True:
    with open('Success.txt', 'r') as file:
        message = file.read()      
        
    print(f.renderText('NOTIFICATION'))
    telegram_send.send(messages=[message])
    print("Notification sent.")
    time.sleep(60)
