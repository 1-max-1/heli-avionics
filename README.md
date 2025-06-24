# heli-avionics
This repository contains the electronics and software for a flight controller. This controller is designed to run a coaxial helicopter using brushed DC motors. I had to learn alot for this project, as there were several things I had no experience with, such as the radio transciever circuitry. However it was fun to make and I think the pcb turned out well.

<img src="https://github.com/user-attachments/assets/528543c5-ad05-44f8-a49a-dd642d59fcf7" alt="Description" width="70%">

![Image](https://github.com/user-attachments/assets/3179f312-4448-4294-99f2-64587d49be68)

⚠ *Note: the software is still in progress, only the electronics have been completed. Additionally, I have not yet ordered the parts so do not have a real photo - for now, please see the 3d-render above.*

# Electronics
**Motor drivers**

The system uses three `DRV8212` BDC motor drivers to drive the tail and coaxial propellors. Some analysis shows that these chips should handle the current demands while remaining below maximum safe temperatures.
The motor driver circuit also includes significant bulk capacitance to handle large spikes in motor current.

The first design of the motor driver circuit used 1 driver chip for both motors. However after more testing I found that the motors drew more current than expected when at full power. This was over the maximum limit of the motor driver chip. Initially, I started looking for replacement chips with better capabilities. However, the options were either too big, unavailable or could not operate at the voltage I wanted. Eventually I realised this was the wrong way to go about it and decided to have another look at the original drivers. I discovered that if the 2 outputs on the chip were joined together, this would effectively double the maximum current, which was now sufficient for these motors. However, this solution does require 2 driver ships instead of one. I initially had concerns about space on the board, but after many hours of rearranging and rerouting I found a way to fit both parts on the board.

**MCU**

The MCU is an `atmega4808`. Although possibly not the fanciest choice, I selected this one because it's easy to program, I have used it before, and I know how to make it work.

**Programming**

The MCU can be programmed through UPDI or through the USART pins (once the bootloader has been uploaded). These are broken out to pin headers for easy access. The board also includes an external reset line + button.

I have also broken out an I2C line and a spare GPIO to another pin header in case I want to add more things onto the helicopter in the future.

**Radio**

This board includes a rf transciever: `nrf24l01`. Like the MCU, this is not fancy but there's alot of documentation for it and I'd rather start with something easier because my rf knowledge is limited (for now).
The board contains an impedance matching network to match the transceiver output to 50 ohms. A wire antenna is used because it should give the best range and I dont have space for a PCB antenna or any bulky connectors like SMA. The antenna will also have to be tuned by cutting it to a specific length. I think UC has network analyzers which could help with this...

**Power regulation**

There are two seperate `TPS7A2030` voltage regulators - one for the radio and one for the rest of the circuit. This is done to try and minimize noise on the radio. The MCU also keeps track of the battery voltage through a divider to ensure that it remains at a safe level.

**Sensors**

The board includes a `BMP390` pressure sensor which can be used to determine the altitude of the helicopter.

# Software
TODO

Will use platformIO, c++

# Why?
I found this helicopter in an e-waste center. The remote was missing and the electronics inside of it seemed to be slightly burnt. 

| <img src="https://github.com/user-attachments/assets/891b460c-87d6-47ac-b79f-f41f9f45c5fe" alt="Description" width="70%"> | 
|:--:| 
| *Disassembled helicopter on test stand* |

After taking it apart and relubricating all the shafts and gears, I tested the motors and they still seemed to work fine.
I decided it would be fun to fix it up and make my own controller for it.

# PCBWay
The PCB manufacture and assembly is going to be sponsored by PCBWay. I will move and update this section with a review once the process is complete.
