package com.amby.core;

import io.neow3j.devpack.Hash160;
import io.neow3j.devpack.Runtime;
import io.neow3j.devpack.Storage;
import io.neow3j.devpack.StorageContext;
import io.neow3j.devpack.StorageMap;
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
    static final StorageContext ctx = Storage.getStorageContext();

    static final String KEY_OWNER = "owner";
    static final String KEY_MARKET_COUNT = "count";
    static final String KEY_PAUSED = "paused";

    // Map Info: [Title, Description, Creator]
    static final StorageMap m_info = new StorageMap(ctx, "i");

    // Map Time: [StartTime], [EndTime] (Lưu timestamp mili-giây)
    static final StorageMap m__start_time = new StorageMap(ctx, "st"); 
    static final StorageMap m__end_time = new StorageMap(ctx, "et"); 
    
    // Map Pools: m_poolYes, m_poolNo
    static final StorageMap m_poolYes = new StorageMap(ctx, "py");
    static final StorageMap m_poolNo = new StorageMap(ctx, "pn");
    
    // Map Status & Result
    // 0: Open, 1: Resolved YES, 2: Resolved NO
    static final StorageMap m_status = new StorageMap(ctx, "sr");

    // Map User Points (Số điểm của user)
    // Key: marketId + userHash + outcome -> Value: points (points = amount * leverage)
    static final StorageMap user_points = new StorageMap(ctx, "up");

    // Map Claimed (Đánh dấu đã rút tiền chưa)
    // Key: marketId + userHash -> Value: 1 (đã rút)
    static final StorageMap claimed = new StorageMap(ctx, "c");

    @OnDeployment
    public static void deploy(Object data, boolean update) {
        if (update) return;

        Transaction tx = (Transaction) Runtime.getScriptContainer();

        Hash160 deployer = tx.sender;

        Storage.put(ctx, KEY_OWNER, deployer);
        onOwnerSet.fire(deployer);

        Storage.put(ctx, KEY_MARKET_COUNT, 0);

        Storage.put(ctx, KEY_PAUSED, 0);
    }

    static Event1Arg<Hash160> onOwnerSet;
}