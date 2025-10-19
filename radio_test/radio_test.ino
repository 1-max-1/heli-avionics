#include <SPI.h>
#include <RF24.h>

RF24 radio(21, 5); // CE, CSN

const byte* txAddress = (const byte*)"aviTX";
const byte* rxAddress = (const byte*)"aviRX";

char payload[7] = {'h', 'e', 'l', 'i', ' ', '0', '\0'};

bool isHeli = true;

unsigned long timeOfLastSend = 0;

void setup() {
  Serial.begin(115200);
  timeOfLastSend = millis();

  if (!radio.begin()) {
    Serial.println("Failed to start radio");
    while (true);
  }
  radio.openWritingPipe(isHeli ? txAddress : rxAddress);
  radio.openReadingPipe(1, isHeli ? rxAddress : txAddress);
  radio.setPALevel(RF24_PA_LOW);
  radio.startListening();
}

void loop() {
  if (millis() - timeOfLastSend >= 1500) {
    radio.stopListening();
    radio.write(payload, sizeof(payload));
    payload[5] += 1;
    if (payload[5] >= ('9' + 1)) {
      payload[5] = '0';
    }
    radio.startListening();
    timeOfLastSend = millis();
  }

  if (radio.available()) {
    char buf[sizeof(payload)];
    radio.read(buf, sizeof(payload));
    Serial.println(buf);
  }

  delay(10);
}