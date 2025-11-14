package com.amby.core;

import io.neow3j.devpack.Hash160;
import io.neow3j.devpack.Storage;
import static io.neow3j.devpack.Storage.getReadOnlyContext;
import static io.neow3j.devpack.Storage.getStorageContext;
import static io.neow3j.devpack.StringLiteralHelper.addressToScriptHash;
import io.neow3j.devpack.annotations.DisplayName;
import io.neow3j.devpack.annotations.ManifestExtra;
import io.neow3j.devpack.annotations.OnDeployment;

@DisplayName("HelloWorld")
@ManifestExtra(key = "author", value = "Your Name")
public class AmbYContract {

    static final byte[] ownerKey = new byte[]{0x00};

    static final String staticValue = "Hello World!";

    @OnDeployment
    public static void deploy(Object data, boolean update) {
        Storage.put(getStorageContext(), ownerKey, addressToScriptHash("NNSyinBZAr8HMhjj95MfkKD1PY7YWoDweR"));
    }

    public static Hash160 getOwner() {
        return Storage.getHash160(getReadOnlyContext(), ownerKey);
    }

    public static String getStaticValue() {
        return staticValue;
    }

}
