# This is wrap version of Dlogic SDK C++ lib

* The SDK base on d2xx driver from ftdi

* Only test on window 10. It work, both vcom and d2xx driver can work together.



* In MACOS :
    * Enable "Allow application downloaded from: `everywhere` option. http://osxdaily.com/2016/09/27/allow-apps-from-anywhere-macos-gatekeeper/

    * Install libusb by :  `brew install libusb`
    * Having problem with FTDI d2xx driver. Each time you plug in the ftdi dev, it will be recognized as comport and using vcom driver, cause the d2xx driver can not work well. In order to work well with d2xx driver you need to disable to the ftdi vcom driver and map to the d2xx driver to work with this driver. https://www.ftdichip.com/Drivers/D2XX.htm