type BreakGlassCouncilMemberProps = {
  break_glass_council_member: any[]
}

export function normalizeBreakGlassCouncilMember(storage: BreakGlassCouncilMemberProps) {
  const { break_glass_council_member } = storage

  return break_glass_council_member?.length
    ? break_glass_council_member.map((item) => {
        return {
          id: item.id,
          name: item.name,
          image: item.image,
          userId: item.user_id,
          website: item.website,
        }
      })
    : []
}
