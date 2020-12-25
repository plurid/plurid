import SwiftUI



public struct PluridApplication: View {
    var planes: [String]
    
    public var body: some View {
        PluridView(planes: planes)
    }
}


struct PluridApplication_Previews: PreviewProvider {
    static var previews: some View {
        PluridApplication(
            planes: ["one", "two"]
        )
    }
}
