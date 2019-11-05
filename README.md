# The SDK base on d2xx driver from ftdi
# Only test on window 10. It work, both vcom and d2xx driver can work together.

# In MACOS :  have problem with FTDI d2xx driver. Each time you plug in the ftdi dev, it will be recognized as comport and using vcom driver, cause the d2xx driver can not work well. In order to work well with d2xx driver you need to disable to the ftdi vcom driver and map to the d2xx driver to work with this driver.