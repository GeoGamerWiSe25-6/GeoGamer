FROM docker.osgeo.org/geoserver:2.28.0

COPY init.sh /opt/init.sh

RUN sed -i 's/\r$//' /opt/init.sh \
    && chmod +x /opt/init.sh

ENTRYPOINT ["/bin/bash", "/opt/init.sh"]
