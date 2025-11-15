package com.amby.core;

import io.neow3j.devpack.ByteString;
import io.neow3j.devpack.Hash160;
import static io.neow3j.devpack.Helper.abort;
import static io.neow3j.devpack.Helper.concat;
import static io.neow3j.devpack.Helper.toByteArray;
import io.neow3j.devpack.List;
import io.neow3j.devpack.Runtime;
import io.neow3j.devpack.Storage;
import io.neow3j.devpack.StorageContext;
import io.neow3j.devpack.StorageMap;
import io.neow3j.devpack.Transaction;
import io.neow3j.devpack.annotations.DisplayName;
import io.neow3j.devpack.annotations.ManifestExtra;
import io.neow3j.devpack.annotations.OnDeployment;
import io.neow3j.devpack.annotations.OnNEP17Payment;
import io.neow3j.devpack.annotations.Permission;
import io.neow3j.devpack.annotations.Safe;
import io.neow3j.devpack.contracts.GasToken;
import io.neow3j.devpack.contracts.StdLib;
import io.neow3j.devpack.events.Event1Arg;
import io.neow3j.devpack.events.Event3Args;
import io.neow3j.devpack.events.Event4Args;

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
    static final StorageMap m_start_time = new StorageMap(ctx, "st"); 
    static final StorageMap m_end_time = new StorageMap(ctx, "et"); 
    
    // Map Pools: m_poolYes, m_poolNo
    static final StorageMap m_poolYes = new StorageMap(ctx, "py");
    static final StorageMap m_poolNo = new StorageMap(ctx, "pn");
    
    // Map Status & Result
    // 0: Open, 1: Resolved YES, 2: Resolved NO
    static final StorageMap m_status = new StorageMap(ctx, "sr");

    // Map User Points (Số điểm của user)
    // Key: marketId + userHash + outcome -> Value: points (points = amount * leverage)
    static final StorageMap user_points = new StorageMap(ctx, "up");

    // Map User Points (Số điểm của user)
    // Key: marketId -> Value: points (points = amount * leverage)
    static final StorageMap total_yes_points = new StorageMap(ctx, "typ");
    static final StorageMap total_no_points = new StorageMap(ctx, "tnp");

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
    static Event4Args<Hash160, Integer, Integer, Integer> onBetPlaced;

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

        m_start_time.put(id, startTime);
        m_end_time.put(id, endTime);

        m_poolYes.put(id, 0);
        m_poolNo.put(id, 0);

        m_status.put(id, 0);

        total_yes_points.put(id, 0);
        total_no_points.put(id, 0);

        onMarketCreated.fire(id, title, endTime);
    }

    /**
     * LOGIC VOTE (Nhận tiền tự động)
     * User gửi GAS + Data: [marketId, outcome] (1=Yes, 2=No)
     */
    @OnNEP17Payment
    public static void vote(Hash160 from, int amount, Object data) {
        GasToken gasToken = new GasToken();
        if (Runtime.getCallingScriptHash() != gasToken.getHash()) abort("Only use GAS token!");
        
        if (data == null) abort("No selection yet!");
        Object[] params = (Object[]) data;
        if (params.length != 2) abort("Incorrect format data!");

        int marketId = (Integer) params[0];
        int outcome = (Integer) params[1]; // Quy ước: 1 = YES, 2 = NO

        if (outcome != 1 && outcome != 2) abort("Not a choice!");

        if (m_end_time.get(marketId) == null) abort("Market does not exists!"); 
        
        int startTime = m_start_time.get(marketId).toInt();
        int endTime = m_end_time.get(marketId).toInt();
        int currentTime = Runtime.getTime();
        if (currentTime >= endTime) abort("Market is overtime!");

        int status = m_status.get(marketId).toInt();
        if (status != 0) abort("Market has closed!");

        if (outcome == 1) {
            int current = m_poolYes.get(marketId).toInt();
            m_poolYes.put(marketId, current + amount);
        } else {
            int current = m_poolNo.get(marketId).toInt();
            m_poolNo.put(marketId, current + amount);
        }

        byte[] keyPoint = concat(concat(toByteArray(marketId), from.toByteArray()), toByteArray(outcome));
        int pointAdded = calculatePoint(startTime, endTime, currentTime, amount);
        if(user_points.get(keyPoint) != null){
            int currentPoint = user_points.get(keyPoint).toInt();
            user_points.put(keyPoint, currentPoint + pointAdded);
        } else{
            user_points.put(keyPoint, pointAdded);
        }

        if(outcome == 1){
            int currentYesPoint = total_yes_points.get(marketId).toInt();
            total_yes_points.put(marketId, currentYesPoint + pointAdded);
        } else{
            int currentNoPoint = total_no_points.get(marketId).toInt();
            total_no_points.put(marketId, currentNoPoint + pointAdded);
        }

        onBetPlaced.fire(from, marketId, outcome, amount);
    }

    // HELPER FUNCTION
    @Safe
    public static int getCount() {
        ByteString v = Storage.get(ctx, KEY_MARKET_COUNT);
        return (v == null) ? 0 : v.toInt();
    }

    private static int calculatePoint(int startTime, int endTime, int currentTime, int amount){
        int timeRemained = endTime - currentTime;
        int timeTotal = endTime - startTime;
        int leverage = ceilDiv(timeRemained * 36, timeTotal);
        return amount * leverage;
    }

    private static int ceilDiv(int a, int b) {
        return (a + b - 1) / b;
    }

    @Safe
    public static int viewTvl(int marketId){
        return m_poolYes.get(marketId).toInt() + m_poolNo.get(marketId).toInt();
    }

    @Safe
    public static int totalYesPoint(int marketId){
        return total_yes_points.get(marketId).toInt();
    }

    @Safe
    public static int totalNoPoint(int marketId){
        return total_no_points.get(marketId).toInt();
    }

    @Safe
    public static int potentialReward(int marketId, int outcome, int amount){
        int currentTime = Runtime.getTime();
        int startTime = m_start_time.get(marketId).toInt();
        int endTime = m_end_time.get(marketId).toInt();

        int pointAdded = calculatePoint(startTime, endTime, currentTime, amount);

        int totalPoint = ((amount == 1) ? total_yes_points.get(marketId).toInt() : total_no_points.get(marketId).toInt()) + pointAdded;

        int totalPool = ((amount == 1) ? m_poolYes.get(marketId).toInt() : m_poolNo.get(marketId).toInt()) + amount;
        
        return (totalPool * pointAdded) / totalPoint;
    }

    @Safe
    public static int startTime(int marketId){
        return m_start_time.get(marketId).toInt();
    }

    @Safe
    public static int endTime(int marketId){
        return m_end_time.get(marketId).toInt();
    }
}