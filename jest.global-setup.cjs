/* global process */
// テストの実行環境（ローカルは JST、CI は UTC）でタイムゾーンをそろえる。
// テストファイル内で process.env.TZ を変えてもワーカーの Date には効かないため、
// ワーカー起動前のここで設定する。
module.exports = async () => {
  process.env.TZ = 'Asia/Tokyo';
};
