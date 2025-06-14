puts "✅ 初期データ（RoleCategory, Role, Industry）を投入します"

role_categories = [
  { name: '会社員系', sort_order: 1 },
  { name: 'フリー系', sort_order: 2 },
  { name: 'クリエイティブ系', sort_order: 3 },
  { name: 'その他', sort_order: 4 }
]

roles = {
  '会社員系' => %w[営業 経理 総務 エンジニア デザイナー],
  'フリー系' => %w[フリーランス 自営業 コンサルタント],
  'クリエイティブ系' => %w[イラストレーター 音楽家 映像クリエイター],
  'その他' => %w[学生 無職 その他]
}

industries = %w[
  建築 製造 教育 IT 飲食 金融 医療 小売 不動産 運輸
  広告 コンサルティング エンタメ 公共サービス 農業
  美容・理容 該当なし
]

ActiveRecord::Base.transaction do
  # RoleCategory登録
  role_categories.each do |cat|
    rc = RoleCategory.find_or_initialize_by(name: cat[:name])
    rc.sort_order = cat[:sort_order]
    rc.save!
  end

  # Role登録
  roles.each do |category_name, role_names|
    rc = RoleCategory.find_by!(name: category_name)
    role_names.each.with_index(1) do |role_name, i|
      role = Role.find_or_initialize_by(name: role_name, role_category: rc)
      role.sort_order = i
      role.save!
    end
  end

  # Industry登録
  industries.each.with_index(1) do |name, i|
    ind = Industry.find_or_initialize_by(name: name)
    ind.sort_order = i
    ind.save!
  end
end

puts "✅ 管理者ユーザーを作成します"

# 管理者Aのみ登録（冪等性あり）
admin_email = 'segawasho0825@gmail.com'
admin_name = '管理者A'

user = User.find_or_initialize_by(email: admin_email)
if user.new_record?
  user.name = admin_name
  user.password = 'password'
  user.password_confirmation = 'password'
  user.is_admin = true
  user.role = Role.first  # 会社員系の1番目が入る想定
  user.industry = Industry.first
  user.save!
  puts "✅ #{admin_name} 登録完了"
else
  puts "✅ #{admin_name} は既に存在します"
end
