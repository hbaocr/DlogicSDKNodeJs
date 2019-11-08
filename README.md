# This is wrap version of Dlogic SDK C++ lib

* The SDK base on d2xx driver from ftdi

* Only test on window 10. It work, both vcom and d2xx driver can work together.

* In Linux: 
    *  Follow this link to install D2XX driver : https://www.youtube.com/watch?v=jynlynjOOek
    *  Make sure change all the  D2XX and uFReader lib to 0755
    ```Sh
        sudo chmod 0755 ./ufr-lib-master/linux/x86_64/libuFCoder-x86_64.so
        cd  /usr/local/lib/
        sudo chmod 0755 libftd2xx.a libftd2xx.so libftd2xx.so.1.4.8
    ```

    * run `uFCoder1x.sh` as sudo then restart to permently remove the OS builtin FTDI VCP driver. This action will let the linux OS use new installed D2XX driver instead of default builtin VCP one.

    ```Sh
    #!/bin/bash
    if [ "$(id -u)" = "0" ]; then
        rm "/etc/modprobe.d/ftdi.conf"
        touch "/etc/modprobe.d/ftdi.conf"
        echo "blacklist ftdi_sio" >> "/etc/modprobe.d/ftdi.conf"
        echo "blacklist usbserial" >> "/etc/modprobe.d/ftdi.conf"
        echo "-------------------------------------------------------------------------"
        echo "Added \"ftdi_conf\" blacklist file to /etc/modprobe.d/ "
        echo "-------------------------------------------------------------------------"
        GROUPADD="usb_access"
        groupadd $GROUPADD
        echo -n "Enter an existing user  :"
            read ADDUSER
        adduser $ADDUSER  $GROUPADD
        exit 1
    else
        echo "You Need To Be Root!"
    fi

    exec sudo "$0" "$@" # enters root mode, resets script and adds permissions and ftdi.confssss
    exit 1

    ```

    * By default linux require sudo (root user) to access usb driver. So you need sudo to run index.js
    ```Sh
        # sudo /home/<username>/.nvm/versions/node/v10.17.0/bin/node index.js
        sudo /absolute_path_to_node/node index.js
    ```


* In MACOS :
    * Enable "Allow application downloaded from: `everywhere` option. http://osxdaily.com/2016/09/27/allow-apps-from-anywhere-macos-gatekeeper/

    * Install libusb by :  `brew install libusb`
    * Having problem with FTDI d2xx driver. Each time you plug in the ftdi dev, it will be recognized as comport and using vcom driver, cause the d2xx driver can not work well. In order to work well with d2xx driver you need to disable to the ftdi vcom driver and map to the d2xx driver to work with this driver. https://www.ftdichip.com/Drivers/D2XX.htm