# heli-avionics
This repository contains the electronics and software for a rc-helicopter control system. This includes an onboard flight computer and a mobile application for remote control.
The PCB is designed to drive coaxial blades using brushed DC motors. It also contains an rf transciever chip for wireless communication and a pressure sensor for altitude measurement.

I had to learn alot for this project, as there were several things I had no experience with such as the radio transceiver circuitry. In the end, it turned out well and was very fun to make.

<img src="https://github.com/user-attachments/assets/1ca32720-1bc9-4d4e-8413-367f199bee7a" alt="Description" width="70%">

<img src="https://github.com/user-attachments/assets/528543c5-ad05-44f8-a49a-dd642d59fcf7" alt="Description" width="70%">

# PCBWay
The PCB fabrication and assembly was sponsored by [PCBWay](https://www.pcbway.com/). I’m pleased with how it turned out, and I’ve written a short review below based on my experience working with them.

#### PCB Quality
The boards appear durable and well-made, with solid electrical connectivity. Silkscreen print is sharp and the overall finish gives off a professional feel.

#### Assembly Quality
Assembly was just as good. All components were placed with precision and the soldering was clean. There were no bridges, no excess, and everything stayed neatly within the boundaries.

#### Communication & Support
Working with PCBWay was a smooth experience. They were professional and quick to respond to any questions I had. One thing I really appreciated was their communication before making any key decisions. For example:
- When a part was unavailable, they suggested alternatives instead of just swapping it.
- They double-checked with me before sourcing alternative components.
- After assembly, the team contacted me about the orientation of a particular component as the markings were slightly ambiguous.

#### Pricing & Turnaround
Pricing was fair, considering the quality and the support included. Quoting and sourcing components was made easy — PCBWay handled that for me, which saved a lot of time. Shipping was fast and the boards arrived well-packed.

Overall, I'm happy with the result and wouldn’t hesitate to use PCBWay again in future projects. If you’re looking for a PCB manufacturer that’s reliable, responsive, and produces high-quality results, they’re worth checking out.

# Electronics
**Motor drivers**

The system uses three `DRV8212` BDC motor drivers to drive the tail and coaxial propellors. Some analysis shows that these chips should handle the current demands while remaining below maximum safe temperatures.
The motor driver circuit also includes significant bulk capacitance to handle large spikes in motor current.

The first design of the motor driver circuit used 1 driver chip for both motors. However after more testing, I found that the motors drew more current than expected when at full power. This was over the maximum limit of the motor driver chip. Initially, I started looking for replacement chips with better capabilities. However, the options were either too big, unavailable or could not operate at the voltage I wanted. Eventually, I realised this was the wrong way to go about it and decided to have another look at the original drivers. I discovered that if the 2 outputs on the chip were joined together, this would effectively double the maximum current, which was now sufficient for these motors. However, this solution does require 2 driver chips instead of one. I initially had concerns about space on the board, but after many hours of rearranging and rerouting I found a way to fit both parts on the board.

**MCU**

The MCU is an `atmega4808`. Although possibly not the fanciest choice, I selected this one because it's easy to program, I have used it before, and I know how to make it work.

**Programming**

The MCU can be programmed through UPDI or through the USART pins (once the bootloader has been uploaded). These are broken out to pin headers for easy access. The board also includes an external reset line + button.

I have also broken out an I2C line and a spare GPIO to another pin header in case I want to add more things onto the helicopter in the future.

**Radio**

This board includes a rf transceiver: `nrf24l01`. Like the MCU, this is not fancy but there's alot of documentation for it and I'd rather start with something easier because my rf knowledge is limited (for now).
The board contains an impedance matching network to match the transceiver output to 50 ohms. A wire antenna is used because it should give the best range and I dont have space for a PCB antenna or any bulky connectors like SMA. The antenna will also have to be tuned by cutting it to a specific length. I think UC has network analyzers which could help with this...

**Power regulation**

There are two seperate `TPS7A2030` voltage regulators - one for the radio and one for the rest of the circuit. This is done to try and minimize noise on the radio. The MCU also keeps track of the battery voltage through a divider to ensure that it remains at a safe level.

**Sensors**

The board includes a `BMP390` pressure sensor which can be used to determine the altitude of the helicopter.

# Software
TODO

Using platformIO, c++

### AeroLink
IN PROGRESS

This is a small esp32-based device which is placed near the user when flying the helicopter.
It acts as a bridge between the flight computer and the mobile application.
BLE messages are processed and sent over a long range nrf24 link, and vice versa.

# Controller app
IN PROGRESS

This is a [React Native](https://reactnative.dev/) mobile application for control of the helicopter.
It includes throttle and directional controls, trim adjustment, buttons for extra features (e.g. auto landing), telemetry display and signal strength indication.
The app automatically connects to the AeroLink and communicates with it.

<img width="50%" alt="controller-app" src="https://github.com/user-attachments/assets/0a143e04-c6b2-41fc-b6b2-261f24719a83" />


# Why?
I found this helicopter in an e-waste center. The remote was missing and some of the electronics seemed to be burnt. 

| <img src="https://github.com/user-attachments/assets/891b460c-87d6-47ac-b79f-f41f9f45c5fe" alt="Description" width="70%"> | 
|:--:| 
| *Disassembled helicopter on test stand* |

After taking it apart and relubricating all the shafts and gears, I tested the motors and they still seemed to work fine.
I decided it would be fun to fix it up and make my own controller for it.
