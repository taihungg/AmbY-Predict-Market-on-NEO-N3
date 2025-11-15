package com.amby.core;

import io.neow3j.devpack.ByteString;
import io.neow3j.devpack.Hash160;
import static io.neow3j.devpack.Helper.abort;
import io.neow3j.devpack.List;
import io.neow3j.devpack.Runtime;
import io.neow3j.devpack.Storage;
import io.neow3j.devpack.StorageContext;
import io.neow3j.devpack.StorageMap;
import io.neow3j.devpack.Transaction;
import io.neow3j.devpack.annotations.DisplayName;
import io.neow3j.devpack.annotations.ManifestExtra;
import io.neow3j.devpack.annotations.OnDeployment;
import io.neow3j.devpack.annotations.Permission;
import io.neow3j.devpack.annotations.Safe;
import io.neow3j.devpack.contracts.StdLib;
import io.neow3j.devpack.events.Event1Arg;
import io.neow3j.devpack.events.Event3Args;

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
    static Event3Args<Integer, String, Integer> onMarketCreated;

    /**
     * TẠO THỊ TRƯỜNG MỚI
     * @param title Tiêu đề câu hỏi (VD: "BTC > 100k?")
     * @param description Mô tả sự kiện
     * @param endTime Thời gian kết thúc (Timestamp ms)
     */
    public static void createMarket(String title, String description, int endTime) {
        int startTime = Runtime.getTime();
        if (endTime <= startTime) abort("Invalid end time!");

        int id = getCount() + 1;
        Storage.put(ctx, KEY_MARKET_COUNT, id);

        List<Object> info = new List<>();
        info.add(title);
        info.add(description);
        info.add(((Transaction) Runtime.getScriptContainer()).sender);
        ByteString serializedInfo = new StdLib().serialize(info);
        m_info.put(id, serializedInfo);

        m__start_time.put(id, startTime);
        m__end_time.put(id, endTime);

        m_poolYes.put(id, 0);
        m_poolNo.put(id, 0);

        m_status.put(id, 0);

        onMarketCreated.fire(id, title, endTime);
    }

    // HELPER FUNCTION
    @Safe
    public static int getCount() {
        ByteString v = Storage.get(ctx, KEY_MARKET_COUNT);
        return (v == null) ? 0 : v.toInt();
    }
}