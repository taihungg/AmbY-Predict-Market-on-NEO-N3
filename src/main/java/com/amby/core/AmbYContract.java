package com.amby.core;

import io.neow3j.devpack.Hash160;
import io.neow3j.devpack.Runtime;
import io.neow3j.devpack.Storage;
import io.neow3j.devpack.StorageContext;
import io.neow3j.devpack.Transaction;
import io.neow3j.devpack.annotations.DisplayName;
import io.neow3j.devpack.annotations.ManifestExtra;
import io.neow3j.devpack.annotations.OnDeployment;
import io.neow3j.devpack.annotations.Permission;
import io.neow3j.devpack.events.Event1Arg;

@DisplayName("AmbYThePredictMarket")
@ManifestExtra(key = "author", value = "BrianNg")
@Permission(contract = "*")
public class AmbYContract {
    static final String KEY_OWNER = "owner";
    static final String KEY_MARKET_COUNT = "count";
    static final String KEY_PAUSED = "paused";

    @OnDeployment
    public static void deploy(Object data, boolean update) {
        if (update) return;

        StorageContext ctx = Storage.getStorageContext();

        Transaction tx = (Transaction) Runtime.getScriptContainer();

        Hash160 deployer = tx.sender;

        Storage.put(ctx, KEY_OWNER, deployer);
        onOwnerSet.fire(deployer);

        Storage.put(ctx, KEY_MARKET_COUNT, 0);

        Storage.put(ctx, KEY_PAUSED, 0);
    }

    static Event1Arg<Hash160> onOwnerSet;
}