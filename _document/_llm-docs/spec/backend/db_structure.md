# データ設計（Cloudflare KV）

## 注文

Key: `order:{userId}:{orderId}`

キーにuserIdを含めることで、1名前空間で「個別取得・更新」と「ユーザー別一覧」の両方を賄います。別途のユーザー索引は持ちません。

| アクセスパターン     | 取得方法                                                      |
| -------------------- | ------------------------------------------------------------- |
| 注文の個別取得・更新 | キー直指定（Slack ボタンの value に userId+orderId を載せる） |
| ユーザーの注文履歴   | `order:{userId}:` の前方一致 list                             |

Value:

```json
{
  "orderId": "ord_001",
  "userId": "Uxxxx",
  "name": "ユーザーの表示名",
  "orderList": [{ "productId": "<microCMS id>", "name": "タコス", "qty": 2, "price": 480 }],
  "status": "open",
  "serviceNotificationToken": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```
