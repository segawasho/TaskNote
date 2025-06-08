if RoleCategory.exists?
  puts "✅ 初期データ（RoleCategory, Role, Industry）は既に投入済みです。"
else
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
    建築
    製造
    教育
    IT
    飲食
    金融
    医療
    小売
    不動産
    運輸
    広告
    コンサルティング
    エンタメ
    公共サービス
    農業
    美容・理容
    該当なし
  ]

  ActiveRecord::Base.transaction do
    role_categories.each do |cat|
      rc = RoleCategory.find_or_create_by!(name: cat[:name]) do |r|
        r.sort_order = cat[:sort_order]
      end
    end

    roles.each do |category_name, role_names|
      rc = RoleCategory.find_by!(name: category_name)
      i = 1
      role_names.each do |role_name|
        Role.find_or_create_by!(name: role_name, role_category: rc) do |r|
          r.sort_order = i
        end
        i += 1
      end
    end

    i = 1
    industries.each do |name|
      Industry.find_or_create_by!(name: name) do |ind|
        ind.sort_order = i
      end
      i += 1
    end
  end
end


puts "✅ 管理者ユーザーを作成します"

unless User.exists?(email: 'segawasho0825@gmail.com')
  User.create!(
    name: '管理者A',
    email: 'segawasho0825@gmail.com',
    password: 'password',
    password_confirmation: 'password',
    is_admin: true,
    role_id: Role.first.id,
    industry_id: Industry.first.id
  )
  puts "✅ 管理者A 登録完了"
end

unless User.exists?(email: 'segawasho0825pro@gmail.com')
  User.create!(
    name: '管理者B',
    email: 'segawasho0825pro@gmail.com',
    password: 'password',
    password_confirmation: 'password',
    is_admin: true,
    role_id: Role.last.id,
    industry_id: Industry.last.id
  )
  puts "✅ 管理者B 登録完了"
end
