#!/bin/bash

# Make sure Java uses the correct TLS certificates
function update_java_ca_certificates {
    /usr/sbin/update-ca-certificates || true

    local shared_cacerts="/etc/ssl/certs/adoptium/cacerts"
    if [ ! -s "$shared_cacerts" ]; then
        dpkg-reconfigure adoptium-ca-certificates || true
        if [ ! -s "$shared_cacerts" ]; then
            echo "# Shared 'cacerts' are missing at $shared_cacerts"
            return
        fi
    fi

    local java_home="$(java -XshowSettings:properties -version 2>&1 | grep "java.home" | awk '{print $3}')"
    if [ -z "$java_home" ]; then
        echo "# Unable to determine JAVA_HOME"
        return
    fi

    local local_cacerts="$java_home/lib/security/cacerts"
    if [ ! -L "$local_cacerts" ]; then
        echo "# Correcting cacerts symlink ..."
        ln -fs "$shared_cacerts" "$local_cacerts"
    fi
}

update_java_ca_certificates

/bin/systemctl restart --no-block openems.service